import { Request, Response } from "express";
import { parse } from "papaparse";
import { ParticipantSchema, Participant } from "../types/participant";
import fs from "fs";
import path from "path";
import { generateSecretSantaPairs } from "../services/secret-santa-shuffler";
import { Parser } from "json2csv";

export const processCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Type guard to ensure req.files is a dictionary
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

    // Type assertion to tell TypeScript that req.files is a dictionary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Access files using bracket notation
    const currentParticipantsFiles = files["currentParticipants"];
    const previousPairingsFiles = files["previousPairings"];

    if (!currentParticipantsFiles || !previousPairingsFiles) {
      res.status(400).json({ error: "Both files are required" });
      return;
    }

    // Rest of your code remains the same...
    const currentParticipantsFilePath = path.join(
      __dirname,
      "../../uploads",
      currentParticipantsFiles[0].filename
    );
    const previousPairingsFilePath = path.join(
      __dirname,
      "../../uploads",
      previousPairingsFiles[0].filename
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

    const currentParticipants = parsedCurrentParticipants.data.map((row) =>
      ParticipantSchema.parse(row)
    );

    if (currentParticipants.length < 2) {
      res.status(400).json({ error: "At least 2 participants required" });
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
  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
