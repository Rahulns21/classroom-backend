import express from "express";
import { db } from "../db";
import { classes } from "../db/schema";
import { classSchema } from "../lib/schema";
import { z } from "zod";
import { randomBytes } from "node:crypto";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const parsed = classSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.flattenError(parsed.error).fieldErrors,
      });
    }

    const inviteCode = randomBytes(6)
      .toString("base64url")
      .slice(0, 8)
      .toUpperCase();

    const [createdClass] = await db
      .insert(classes)
      .values({
        ...parsed.data,
        inviteCode,
      })
      .returning({ id: classes.id });

    if (!createdClass) {
      throw new Error("Failed to create class");
    }

    return res.status(201).json({
      data: createdClass,
    });
  } catch (e) {
    console.error(`POST /classes error: ${e}`);

    if (e instanceof Error && e.cause) {
      console.error("Database Error Cause:", e.cause);
    }

    return res.status(500).json({
      error: "Failed to create class",
    });
  }
});

export default router;
