const request = require("supertest");
let app;

beforeAll(() => {
  app = require("../server");
});

describe("Ripple Routes", () => {
  it("should return all posts (empty initially)", async () => {
    const res = await request(app).get("/ripple");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should show created posts after users add them", async () => {
    await request(app).post("/register").send({
      username: "Sam",
      email: "sam@example.com",
      password: "123456",
    });

    const loginRes = await request(app).post("/login").send({
      email: "sam@example.com",
      password: "123456",
    });
    const token = loginRes.body.token;

    await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "high", content: "Ripple testing" });

    const res = await request(app).get("/ripple");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
