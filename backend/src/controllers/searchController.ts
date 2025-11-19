import type { Request, Response } from "express";
import pool from "../db/index.js";

export async function searchLibrary(req: Request, res: Response) {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ message: "Search query required" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT l.id, l.first_name, l.last_name, l.room, STRING_AGG(s.subject_name, ', ') AS subjects
      FROM librarians l
      LEFT JOIN librarian_subjects ls ON l.id = ls.librarian_id
      LEFT JOIN subjects s ON ls.subject_id = s.id
      WHERE (l.first_name || ' ' || l.last_name) ILIKE $1
        OR l.first_name ILIKE $1
        OR l.last_name ILIKE $1
        OR l.room ILIKE $1
        OR s.subject_name ILIKE $1
      GROUP BY l.id, l.first_name, l.last_name, l.room
      `,
      [`%${query}%`]
    );

    if (rows.length === 0) {
      return res.json({ message: "No results found", results: [] });
    }

    res.json({ results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
