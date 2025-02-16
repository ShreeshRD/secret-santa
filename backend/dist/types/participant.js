"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantSchema = void 0;
const zod_1 = require("zod");
exports.ParticipantSchema = zod_1.z.object({
    Employee_Name: zod_1.z.string().min(1),
    Employee_EmailID: zod_1.z.string().email(),
});
