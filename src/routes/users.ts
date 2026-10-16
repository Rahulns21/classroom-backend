import { and, desc, eq, getColumns, ilike, or, sql, SQL } from "drizzle-orm";
import express from "express";
import { db } from "../db";
import { user } from "../db/schema";
import { parsePositiveInt } from "../lib/query";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, role, page, limit } = req.query;

    const currentPage = parsePositiveInt(page, 1, 10_000);
    const limitPerPage = parsePositiveInt(limit, 10, 100);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions: (SQL | undefined)[] = [];

    if (search) {
      filterConditions.push(
        or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
      );
    }

    if (role) {
      filterConditions.push(eq(user.role, role as any));
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const usersList = await db
      .select({ ...getColumns(user) })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    return res.status(200).json({
        data: usersList,
        pagination: {
            page: currentPage,
            limit: limitPerPage,
            total: totalCount, 
            totalPages: Math.ceil(totalCount / limitPerPage),
        }
    })
  } catch (e) {
    console.error(`GET /users error: ${e}`);
    return res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
