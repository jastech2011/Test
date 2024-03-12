interface Filter {
  id: string;
  condition: "equals" | "does_not_equal" | "greater_than" | "less_than";
  value: string | number;
}

interface QueryParams {
  limit?: number;
  afterDate?: string;
  beforeDate?: string;
  offset?: number;
  status?: string;
  includeEditLink?: boolean;
  sort?: string;
  filters?: string;
}

async function getFilteredResponses(req: Request, res: Response) {
  try {
    if (!req.body || !Array.isArray(req.body.responses)) {
      return res
        .status(400)
        .send("Invalid request format. 'responses' array is missing.");
    }

    const jsonResponse = req.body;
    const queryParams = req.query as unknown as QueryParams;
    const filters: Filter[] = queryParams.filters
      ? JSON.parse(queryParams.filters)
      : [];
    let filteredResponses = jsonResponse.responses.filter((response: any) => {
      return filters.every((filter: Filter) => {
        const question = response.questions.find(
          (q: any) => q.id === filter.id
        );
        if (!question) return false;
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
  } catch (error) {
    const message = (error as Error).message;
    console.error(error);
    res.status(500).send(`Error processing request: ${message}`);
  }
}
