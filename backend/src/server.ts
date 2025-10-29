import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import searchRoutes from "./routes/searchRoutes.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! (Backend)");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));