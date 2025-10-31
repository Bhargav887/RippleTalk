// tests/achievements-trends.test.js
const request = require("supertest");
const app = require("../server");
const User = require("../models/user");

let token;

beforeAll(async () => {
  await User.deleteMany({});
  await request(app).post("/register").send({
    username: "TrendUser",
    email: "trend@example.com",
    password: "123456",
  });

  const login = await request(app).post("/login").send({
    email: "trend@example.com",
    password: "123456",
  });

  token = login.body.token;

  // Add some posts to calculate stats
  await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ mood: "high", content: "Good vibes" });

  await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ mood: "low", content: "Low moment" });
});

describe("Achievements & Mood Trends", () => {
  it("should update achievements", async () => {
    const res = await request(app)
      .patch("/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedStats).toHaveProperty("entries");
    expect(res.body.updatedStats).toHaveProperty("points");
  });

  it("should return mood trends for user", async () => {
    const res = await request(app)
      .get("/mood-trends")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
