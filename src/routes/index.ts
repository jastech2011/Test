import express, { Request, Response, Router } from "express";
import { getFilteredResponses } from "../controllers/responsesController";

const router: Router = express.Router();

router.get("/:formId/filteredResponses", getFilteredResponses);

export default router;
