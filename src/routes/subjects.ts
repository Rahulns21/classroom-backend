import { and, desc, eq, getColumns, ilike, or, sql, SQL } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, Number(page));
    const limitPerPage = Math.max(1, Number(limit));
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions: (SQL | undefined)[] = [];

    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }

    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }

    const whereCause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(subjects)
      .innerJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereCause);

    const totalCount = Number(countResult[0]?.count) ?? 0;

    const subjectsList = await db
      .select({
        ...getColumns(subjects),
        department: { ...getColumns(departments) },
      })
      .from(subjects)
      .innerJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereCause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    return res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error(`GET /subjects error: ${e}`);
    return res.status(500).json({
      error: "Failed to fetch subjects",
    });
  }
});

export default router;