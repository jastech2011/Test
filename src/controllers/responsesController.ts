import dotenv from "dotenv";
import axios from "axios";
import { Request, Response } from "express";

dotenv.config();

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
  filters?: string; // Фільтри тепер можуть бути у форматі JSON рядка
}

async function getFilteredResponses(
  req: Request,
  res: Response
): Promise<void> {
  const formId: string | undefined = process.env.FORM_ID;
  const queryParams = req.query as QueryParams;

  try {
    if (!formId) {
      throw new Error("FORM_ID environment variable is not set.");
    }

    const filters: Filter[] = queryParams.filters
      ? JSON.parse(queryParams.filters)
      : [];

    const apiUrl: string = `https://form.fillout.com/t/${formId}`;
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.FILLOUT_API_KEY}`,
    };
    const {
      limit,
      afterDate,
      beforeDate,
      offset,
      status,
      includeEditLink,
      sort,
    } = queryParams;
    const params = {
      limit,
      afterDate,
      beforeDate,
      offset,
      status,
      includeEditLink,
      sort,
    };

    const response = await axios.get(apiUrl, { headers, params });
    console.log(">>", response.data.responses, params);
    const filteredResponses = response?.data.responses.filter(
      (response: any) => {
        if (!response.questions || !Array.isArray(response.questions)) {
          return false;
        }
        return filters.every((filter: Filter) => {
          const question = response.questions.find(
            (q: any) => q.id === filter.id
          );
          if (!question) return false;
          if (!filter) return false;

          switch (filter.condition) {
            case "equals":
              return question.value === filter.value;
            case "does_not_equal":
              return question.value !== filter.value;
            case "greater_than":
              return question.value > filter.value;
            case "less_than":
              return question.value < filter.value;
            default:
              return false;
          }
        });
      }
    );

    res.json({
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount: Math.ceil(filteredResponses.length / (limit || 1)),
    });
  } catch (error) {
    const message = (error as Error).message;
    console.error(error);
    res.status(500).send(`Error fetching filtered responses: ${message}`);
  }
}

export { getFilteredResponses };
