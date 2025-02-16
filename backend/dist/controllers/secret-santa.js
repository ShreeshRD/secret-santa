"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCSV = void 0;
const papaparse_1 = require("papaparse");
const participant_1 = require("../types/participant");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const secret_santa_shuffler_1 = require("../services/secret-santa-shuffler");
const json2csv_1 = require("json2csv");
const uploadsFolder = path_1.default.join(__dirname, "../../uploads");
// Helper to delete all files except the ones specified
const cleanUploadsFolderExcept = (filesToKeep) => {
    if (!fs_1.default.existsSync(uploadsFolder))
        return;
    const files = fs_1.default.readdirSync(uploadsFolder);
    files.forEach((file) => {
        if (!filesToKeep.includes(file)) {
            fs_1.default.unlinkSync(path_1.default.join(uploadsFolder, file));
        }
    });
};
const processCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    // Flag to know if the request was successful
    let successful = false;
    // Store filenames and full file paths for later cleanup
    let currentParticipantsFilePath = null;
    let previousPairingsFilePath = null;
    let currentParticipantsFilename = null;
    let previousPairingsFilename = null;
    try {
        // Type guard: ensure req.files is a dictionary
        if (!req.files ||
            typeof req.files !== "object" ||
            Array.isArray(req.files)) {
            res
                .status(400)
                .json({ error: "No files uploaded or invalid file format" });
            return;
        }
        // Type assertion: req.files is a dictionary
        const files = req.files;
        // Access files using bracket notation
        const currentParticipantsFiles = files["currentParticipants"];
        const previousPairingsFiles = files["previousPairings"];
        if (!currentParticipantsFiles || !previousPairingsFiles) {
            res.status(400).json({ error: "Both files are required" });
            return;
        }
        // Assign filenames and file paths to outer variables for later cleanup.
        currentParticipantsFilename = currentParticipantsFiles[0].filename;
        previousPairingsFilename = previousPairingsFiles[0].filename;
        currentParticipantsFilePath = path_1.default.join(uploadsFolder, currentParticipantsFilename);
        previousPairingsFilePath = path_1.default.join(uploadsFolder, previousPairingsFilename);
        const currentParticipantsContent = fs_1.default.readFileSync(currentParticipantsFilePath, "utf8");
        const previousPairingsContent = fs_1.default.readFileSync(previousPairingsFilePath, "utf8");
        // Parse current participants
        const parsedCurrentParticipants = (0, papaparse_1.parse)(currentParticipantsContent, {
            header: true,
            skipEmptyLines: true,
        });
        if (!parsedCurrentParticipants.data ||
            !Array.isArray(parsedCurrentParticipants.data)) {
            res
                .status(400)
                .json({ error: "Invalid current participants CSV format" });
            return;
        }
        // Parse previous pairings
        const parsedPreviousPairings = (0, papaparse_1.parse)(previousPairingsContent, {
            header: true,
            skipEmptyLines: true,
        });
        if (!parsedPreviousPairings.data ||
            !Array.isArray(parsedPreviousPairings.data)) {
            res.status(400).json({ error: "Invalid previous pairings CSV format" });
            return;
        }
        // Validate headers for current participants
        if (!((_b = (_a = parsedCurrentParticipants.meta) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.includes("Employee_Name")) ||
            !((_d = (_c = parsedCurrentParticipants.meta) === null || _c === void 0 ? void 0 : _c.fields) === null || _d === void 0 ? void 0 : _d.includes("Employee_EmailID"))) {
            res
                .status(400)
                .json({ error: "Invalid current participants CSV format" });
            return;
        }
        // Validate headers for previous pairings
        if (!((_f = (_e = parsedPreviousPairings.meta) === null || _e === void 0 ? void 0 : _e.fields) === null || _f === void 0 ? void 0 : _f.includes("Employee_Name")) ||
            !((_h = (_g = parsedPreviousPairings.meta) === null || _g === void 0 ? void 0 : _g.fields) === null || _h === void 0 ? void 0 : _h.includes("Employee_EmailID")) ||
            !((_k = (_j = parsedPreviousPairings.meta) === null || _j === void 0 ? void 0 : _j.fields) === null || _k === void 0 ? void 0 : _k.includes("Secret_Child_Name")) ||
            !((_m = (_l = parsedPreviousPairings.meta) === null || _l === void 0 ? void 0 : _l.fields) === null || _m === void 0 ? void 0 : _m.includes("Secret_Child_EmailID"))) {
            res.status(400).json({ error: "Invalid previous pairings CSV format" });
            return;
        }
        const currentParticipants = parsedCurrentParticipants.data.map((row) => participant_1.ParticipantSchema.parse(row));
        if (currentParticipants.length < 2) {
            res.status(400).json({ error: "At least 2 participants required" });
            return;
        }
        const previousPairings = parsedPreviousPairings.data.map((row) => ({
            Employee_EmailID: row.Employee_EmailID,
            Secret_Child_EmailID: row.Secret_Child_EmailID,
        }));
        // Generate Secret Santa pairs with constraints
        const pairs = (0, secret_santa_shuffler_1.generateSecretSantaPairs)(currentParticipants, previousPairings);
        // Convert the pairs to CSV
        const json2csvParser = new json2csv_1.Parser();
        const csv = json2csvParser.parse(pairs);
        // Set the response headers to indicate a CSV file is being returned
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=secret-santa-pairs.csv");
        // Send the CSV file as a response
        res.status(200).send(csv);
        successful = true;
    }
    catch (error) {
        console.error("Processing Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
    finally {
        // Cleanup: always remove files uploaded in this request.
        if (successful) {
            // On success: keep only the current request's files
            if (currentParticipantsFilename && previousPairingsFilename) {
                cleanUploadsFolderExcept([
                    currentParticipantsFilename,
                    previousPairingsFilename,
                ]);
            }
        }
        else {
            // On failure: delete any files that were uploaded for this request.
            if (currentParticipantsFilePath &&
                fs_1.default.existsSync(currentParticipantsFilePath)) {
                fs_1.default.unlinkSync(currentParticipantsFilePath);
            }
            if (previousPairingsFilePath && fs_1.default.existsSync(previousPairingsFilePath)) {
                fs_1.default.unlinkSync(previousPairingsFilePath);
            }
        }
    }
});
exports.processCSV = processCSV;
