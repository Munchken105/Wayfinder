import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import searchRoutes from "./routes/searchRoutes.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/search", searchRoutes);

const PORT = process.env.PORT || 5000;

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Catch-all 404 route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));