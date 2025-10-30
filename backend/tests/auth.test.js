const request = require("supertest");
let app;

beforeAll(() => {
  app = require("../server");
});

describe("Auth Routes", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/register").send({
      username: "John",
      email: "john@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("email", "john@example.com");
  });

  it("should not allow duplicate email registration", async () => {
    await request(app).post("/register").send({
      username: "Jane",
      email: "jane@example.com",
      password: "123456",
    });

    const res = await request(app).post("/register").send({
      username: "Jane",
      email: "jane@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("should login successfully", async () => {
    await request(app).post("/register").send({
      username: "Mark",
      email: "mark@example.com",
      password: "mypassword",
    });

    const res = await request(app).post("/login").send({
      email: "mark@example.com",
      password: "mypassword",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with invalid password", async () => {
    await request(app).post("/register").send({
      username: "Tom",
      email: "tom@example.com",
      password: "pass123",
    });

    const res = await request(app).post("/login").send({
      email: "tom@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(400);
  });
});
