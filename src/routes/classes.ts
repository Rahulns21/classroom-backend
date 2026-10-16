import express from "express";
import { db } from "../db";
import { classes } from "../db/schema";
import { error } from "node:console";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const [createdClass] = await db
      .insert(classes)
      .values({
        ...req.body,
        inviteCode: Math.random().toString(36).substring(2, 9),
        schedules: [],
      })
      .returning({ id: classes.id });

    if (!createdClass) throw error;

    return res.status(201).json({
        data: createdClass
    });
  } catch (e) {
    console.error(`POST /classes error: ${e}`);
    return res.status(500).json({
      error: e,
    });
  }
});

export default router;
