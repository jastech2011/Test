import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { getFilteredResponses } from "./src/controllers/getFilteredResponses";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/:formId/filteredResponses", getFilteredResponses);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
