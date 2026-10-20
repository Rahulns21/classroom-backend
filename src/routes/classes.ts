import express from "express";
import { db } from "../db";
import { classes, subjects, user } from "../db/schema";
import { classSchema } from "../lib/schema";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { parsePositiveInt } from "../lib/query";
import { and, desc, eq, getColumns, ilike, or, sql, SQL } from "drizzle-orm";

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

router.get("/", async (req, res) => {
  try {
    const { search, subject, teacher, page, limit } = req.query;

    const currentPage = parsePositiveInt(page, 1, 10_000);
    const limitPerPage = parsePositiveInt(limit, 10, 100);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions: (SQL | undefined)[] = [];

    if (search) {
      filterConditions.push(
        or(
          ilike(classes.name, `%${search}%`),
          ilike(classes.inviteCode, `%${search}%`)
        )
      );
    }

    if (subject) {
      filterConditions.push(eq(classes.subjectId, Number(subject)));
    }

    if (teacher) {
      filterConditions.push(eq(classes.teacherId, String(teacher)));
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id))
      .where(whereClause);

    const totalCount = Number(countResult[0]?.count) ?? 0;

    const classesList = await db
      .select({
        ...getColumns(classes),
        subject: { ...getColumns(subjects) },
        teacher: { ...getColumns(user) },
      })
      .from(classes)
      .leftJoin(subjects, eq(subjects.departmentId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id))
      .where(whereClause)
      .orderBy(desc(classes.createdAt), desc(classes.id))
      .limit(limitPerPage)
      .offset(offset);

    return res.status(200).json({
      data: classesList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error(`GET /classes error: ${e}`);
    return res.status(500).json({
      error: "Failed to fetch classes",
    });
  }
});

export default router;
