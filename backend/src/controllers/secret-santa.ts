import { Request, Response } from "express";
import { parse } from "papaparse";
import { ParticipantSchema, Participant } from "../types/participant";
import fs from "fs";
import path from "path";
import { generateSecretSantaPairs } from "../services/secret-santa-shuffler";
import { Parser } from "json2csv";

const uploadsFolder = path.join(__dirname, "../../uploads");

// Helper to delete all files except the ones specified
const cleanUploadsFolderExcept = (filesToKeep: string[]) => {
  if (!fs.existsSync(uploadsFolder)) return;

  const files = fs.readdirSync(uploadsFolder);
  files.forEach((file) => {
    if (!filesToKeep.includes(file)) {
      fs.unlinkSync(path.join(uploadsFolder, file));
    }
  });
};

export const processCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Flag to know if the request was successful
  let successful = false;

  // Store filenames and full file paths for later cleanup
  let currentParticipantsFilePath: string | null = null;
  let previousPairingsFilePath: string | null = null;
  let currentParticipantsFilename: string | null = null;
  let previousPairingsFilename: string | null = null;

  try {
    // Type guard: ensure req.files is a dictionary
    if (
      !req.files ||
      typeof req.files !== "object" ||
      Array.isArray(req.files)
    ) {
      res
        .status(400)
        .json({ error: "No files uploaded or invalid file format" });
      return;
    }

    // Type assertion: req.files is a dictionary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

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
    currentParticipantsFilePath = path.join(
      uploadsFolder,
      currentParticipantsFilename
    );
    previousPairingsFilePath = path.join(
      uploadsFolder,
      previousPairingsFilename
    );

    const currentParticipantsContent = fs.readFileSync(
      currentParticipantsFilePath,
      "utf8"
    );
    const previousPairingsContent = fs.readFileSync(
      previousPairingsFilePath,
      "utf8"
    );

    // Parse current participants
    const parsedCurrentParticipants = parse<Participant>(
      currentParticipantsContent,
      {
        header: true,
        skipEmptyLines: true,
      }
    );

    if (
      !parsedCurrentParticipants.data ||
      !Array.isArray(parsedCurrentParticipants.data)
    ) {
      res
        .status(400)
        .json({ error: "Invalid current participants CSV format" });
      return;
    }

    // Parse previous pairings
    const parsedPreviousPairings = parse<{
      Employee_EmailID: string;
      Secret_Child_EmailID: string;
    }>(previousPairingsContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (
      !parsedPreviousPairings.data ||
      !Array.isArray(parsedPreviousPairings.data)
    ) {
      res.status(400).json({ error: "Invalid previous pairings CSV format" });
      return;
    }

    // Validate headers for current participants
    if (
      !parsedCurrentParticipants.meta?.fields?.includes("Employee_Name") ||
      !parsedCurrentParticipants.meta?.fields?.includes("Employee_EmailID")
    ) {
      res
        .status(400)
        .json({ error: "Invalid current participants CSV format" });
      return;
    }

    // Validate headers for previous pairings
    if (
      !parsedPreviousPairings.meta?.fields?.includes("Employee_Name") ||
      !parsedPreviousPairings.meta?.fields?.includes("Employee_EmailID") ||
      !parsedPreviousPairings.meta?.fields?.includes("Secret_Child_Name") ||
      !parsedPreviousPairings.meta?.fields?.includes("Secret_Child_EmailID")
    ) {
      res.status(400).json({ error: "Invalid previous pairings CSV format" });
      return;
    }

    const currentParticipants = parsedCurrentParticipants.data.map((row) =>
      ParticipantSchema.parse(row)
    );

    if (currentParticipants.length < 2) {
      res.status(400).json({ error: "At least 2 participants required" });
      return;
    }

    const previousPairings = parsedPreviousPairings.data.map((row) => ({
      Employee_EmailID: row.Employee_EmailID,
      Secret_Child_EmailID: row.Secret_Child_EmailID,
    }));

    // Generate Secret Santa pairs with constraints
    const pairs = generateSecretSantaPairs(
      currentParticipants,
      previousPairings
    );

    // Convert the pairs to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(pairs);

    // Set the response headers to indicate a CSV file is being returned
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=secret-santa-pairs.csv"
    );

    // Send the CSV file as a response
    res.status(200).send(csv);
    successful = true;
  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    // Cleanup: always remove files uploaded in this request.
    if (successful) {
      // On success: keep only the current request's files
      if (currentParticipantsFilename && previousPairingsFilename) {
        cleanUploadsFolderExcept([
          currentParticipantsFilename,
          previousPairingsFilename,
        ]);
      }
    } else {
      // On failure: delete any files that were uploaded for this request.
      if (
        currentParticipantsFilePath &&
        fs.existsSync(currentParticipantsFilePath)
      ) {
        fs.unlinkSync(currentParticipantsFilePath);
      }
      if (previousPairingsFilePath && fs.existsSync(previousPairingsFilePath)) {
        fs.unlinkSync(previousPairingsFilePath);
      }
    }
  }
};
