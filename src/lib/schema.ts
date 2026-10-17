import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subjectId: z.coerce.number().int().positive("Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  description: z.string().optional(),
  bannerUrl: z.string().optional(),
  bannerCldPubId: z.string().optional(),
  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0")
    .max(1000, "Capacity seems too large"),
  status: z.enum(["active", "inactive"]),
  schedules: z.array(z.any()).optional(),
});
