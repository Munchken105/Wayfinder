import type { Request, Response } from "express";
import pool from "../db/index.js";

export async function searchLibrary(req: Request, res: Response) {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ message: "Search query required" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM librarians 
       WHERE name ILIKE $1 
          OR tags ILIKE $1 
          OR department ILIKE $1`,
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
