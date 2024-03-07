const request = require("supertest");
const app = require("../../server"); // Шлях до вашого Express сервера

describe("GET /filteredResponses", () => {
  it("should fetch filtered responses successfully", async () => {
    const formId = "cLZojxk94ous";
    const filters = encodeURIComponent(
      JSON.stringify([{ id: "nameId", condition: "equals", value: "Timmy" }])
    );

    const res = await request(app)
      .get(`/${formId}/filteredResponses?filters=${filters}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("responses");
  });
});
