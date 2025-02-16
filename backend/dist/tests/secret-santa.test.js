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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe("POST /api/secret-santa", () => {
    const testFilesDir = path_1.default.join(__dirname, "test-files");
    beforeAll(() => {
        // Create test files directory
        if (!fs_1.default.existsSync(testFilesDir)) {
            fs_1.default.mkdirSync(testFilesDir);
        }
    });
    afterAll(() => {
        // Cleanup test files directory
        if (fs_1.default.existsSync(testFilesDir)) {
            fs_1.default.rmSync(testFilesDir, { recursive: true });
        }
    });
    describe("Successful pair generation", () => {
        it("should generate pairs with no previous pairings", () => __awaiter(void 0, void 0, void 0, function* () {
            const currentParticipants = path_1.default.join(testFilesDir, "current1.csv");
            const previousPairings = path_1.default.join(testFilesDir, "previous1.csv");
            fs_1.default.writeFileSync(currentParticipants, `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com
Charlie,charlie@example.com`);
            fs_1.default.writeFileSync(previousPairings, `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID\n`); // Empty valid CSV
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", currentParticipants)
                .attach("previousPairings", previousPairings);
            expect(response.status).toBe(200);
            expect(response.header["content-type"]).toMatch(/text\/csv/);
            expect(response.text).toMatch(/"?Employee_Name"?,"?Employee_EmailID"?,"?Secret_Child_Name"?,"?Secret_Child_EmailID"?/);
        }));
        it("should avoid previous pairings", () => __awaiter(void 0, void 0, void 0, function* () {
            const currentParticipants = path_1.default.join(testFilesDir, "current2.csv");
            const previousPairings = path_1.default.join(testFilesDir, "previous2.csv");
            fs_1.default.writeFileSync(currentParticipants, `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com
Charlie,charlie@example.com`);
            fs_1.default.writeFileSync(previousPairings, `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID
Alice,alice@example.com,Bob,bob@example.com`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", currentParticipants)
                .attach("previousPairings", previousPairings);
            const csvData = response.text;
            const aliceLine = csvData
                .split("\n")
                .find((line) => line.includes("alice@example.com"));
            expect(aliceLine).not.toContain("bob@example.com");
        }));
    });
    describe("Input validation", () => {
        it("should reject request with only one file", () => __awaiter(void 0, void 0, void 0, function* () {
            const currentParticipants = path_1.default.join(testFilesDir, "current3.csv");
            fs_1.default.writeFileSync(currentParticipants, `Employee_Name,Employee_EmailID\nAlice,alice@example.com\nBob,bob@example.com`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", currentParticipants);
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/Both files are required/);
        }));
        it("should reject invalid CSV format", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidFile = path_1.default.join(testFilesDir, "invalid.csv");
            fs_1.default.writeFileSync(invalidFile, "Invalid data\nno,headers");
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", invalidFile)
                .attach("previousPairings", invalidFile);
            expect(response.status).toBe(400);
        }));
        it("should reject files with missing headers", () => __awaiter(void 0, void 0, void 0, function* () {
            const badFile = path_1.default.join(testFilesDir, "bad.csv");
            fs_1.default.writeFileSync(badFile, "Name,Email\nAlice,alice@example.com");
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", badFile)
                .attach("previousPairings", badFile);
            expect(response.status).toBe(400);
        }));
    });
    describe("Edge cases", () => {
        it("should handle minimum participants (2)", () => __awaiter(void 0, void 0, void 0, function* () {
            const currentParticipants = path_1.default.join(testFilesDir, "current4.csv");
            const previousPairings = path_1.default.join(testFilesDir, "previous4.csv");
            fs_1.default.writeFileSync(currentParticipants, `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com`);
            fs_1.default.writeFileSync(previousPairings, `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", currentParticipants)
                .attach("previousPairings", previousPairings);
            expect(response.status).toBe(200);
            const pairs = response.text
                .split("\n")
                .slice(1)
                .filter((l) => l);
            expect(pairs).toHaveLength(2);
        }));
        it("should reject insufficient participants (<2)", () => __awaiter(void 0, void 0, void 0, function* () {
            const currentParticipants = path_1.default.join(testFilesDir, "current5.csv");
            const previousPairings = path_1.default.join(testFilesDir, "previous5.csv");
            fs_1.default.writeFileSync(currentParticipants, `Employee_Name,Employee_EmailID\nLonely,lonely@example.com`);
            fs_1.default.writeFileSync(previousPairings, `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", currentParticipants)
                .attach("previousPairings", previousPairings);
            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/At least 2 participants required/);
        }));
    });
    describe("Conflict resolution", () => {
        it("should handle complete constraint conflicts", () => __awaiter(void 0, void 0, void 0, function* () {
            const currentParticipants = path_1.default.join(testFilesDir, "current6.csv");
            const previousPairings = path_1.default.join(testFilesDir, "previous6.csv");
            // Only 2 participants who were previously paired
            fs_1.default.writeFileSync(currentParticipants, `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com`);
            fs_1.default.writeFileSync(previousPairings, `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID
Alice,alice@example.com,Bob,bob@example.com
Bob,bob@example.com,Alice,alice@example.com`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/secret-santa")
                .attach("currentParticipants", currentParticipants)
                .attach("previousPairings", previousPairings);
            // This should fail as no valid derangement possible
            expect(response.status).toBe(500);
            expect(response.body.details).toMatch(/Failed to generate valid pairs/);
        }));
    });
});
