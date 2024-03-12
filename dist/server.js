import dotenv from "dotenv";
import express from "express";
dotenv.config();
const app = express();
app.use(express.json());
async function getFilteredResponses(req, res) {
    try {
        if (!req.body || !Array.isArray(req.body.responses)) {
            return res
                .status(400)
                .send("Invalid request format. 'responses' array is missing.");
        }
        const jsonResponse = req.body;
        const queryParams = req.query;
        const filters = queryParams.filters
            ? JSON.parse(queryParams.filters)
            : [];
        let filteredResponses = jsonResponse.responses.filter((response) => {
            return filters.every((filter) => {
                const question = response.questions.find((q) => q.id === filter.id);
                if (!question)
                    return false;
                switch (filter.condition) {
                    case "equals":
                        return question.value == filter.value;
                    case "does_not_equal":
                        return question.value != filter.value;
                    case "greater_than":
                        return question.value > filter.value;
                    case "less_than":
                        return question.value < filter.value;
                    default:
                        return false;
                }
            });
        });
        res.status(200).json(filteredResponses[0].questions);
    }
    catch (error) {
        const message = error.message;
        console.error(error);
        res.status(500).send(`Error processing request: ${message}`);
    }
}
app.get("/:formId/filteredResponses", getFilteredResponses);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
