import { Router } from "express";
import { searchLibrary } from "../controllers/searchController.js";

const router = Router();

router.get("/", searchLibrary);

export default router;