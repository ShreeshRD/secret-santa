"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const secret_santa_1 = require("./controllers/secret-santa");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// File upload setup
const upload = (0, multer_1.default)({ dest: "uploads/" });
// Routes
app.post("/api/secret-santa", upload.fields([
    { name: "currentParticipants", maxCount: 1 },
    { name: "previousPairings", maxCount: 1 },
]), secret_santa_1.processCSV);
exports.default = app;
