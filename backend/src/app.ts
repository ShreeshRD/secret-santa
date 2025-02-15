import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { processCSV } from "./controllers/secret-santa";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File upload setup
const upload = multer({ dest: "uploads/" });

// Routes
app.post(
  "/api/secret-santa",
  upload.fields([
    { name: "currentParticipants", maxCount: 1 },
    { name: "previousPairings", maxCount: 1 },
  ]),
  processCSV
);

export default app;
