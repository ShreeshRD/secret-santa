import { z } from "zod";

export const ParticipantSchema = z.object({
  Employee_Name: z.string().min(1),
  Employee_EmailID: z.string().email(),
});

export type Participant = z.infer<typeof ParticipantSchema>;
