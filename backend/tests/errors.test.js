// tests/errors.test.js
const request = require("supertest");
const app = require("../server");
const User = require("../models/user");

let token, postId;

beforeAll(async () => {
  await User.deleteMany({});
  await request(app).post("/register").send({
    username: "EdgeUser",
    email: "edge@example.com",
    password: "123456",
  });
  const login = await request(app).post("/login").send({
    email: "edge@example.com",
    password: "123456",
  });
  token = login.body.token;
});

describe("Error & Edge Case Tests", () => {
  test("should reject register with duplicate email", async () => {
    const res = await request(app).post("/register").send({
      username: "EdgeUser2",
      email: "edge@example.com",
      password: "abcdef",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  test("should reject login with wrong password", async () => {
    const res = await request(app).post("/login").send({
      email: "edge@example.com",
      password: "wrong",
    });
    expect(res.statusCode).toBe(400);
  });

  test("should reject access without token", async () => {
    const res = await request(app).get("/my-posts");
    expect(res.statusCode).toBe(401);
  });

  test("should reject access with invalid token", async () => {
    const res = await request(app)
      .get("/my-posts")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(403);
  });

  test("should reject post creation without mood/content", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "", content: "" });
    expect(res.statusCode).toBe(400);
  });

  test("should reject delete for non-existent post", async () => {
    const res = await request(app)
      .delete("/posts/64b8c9c1f8b9d0f8e8f8f8f8")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  test("should reject post delete by another user", async () => {
    // Create post as first user
    const create = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "high", content: "Private post" });
    postId = create.body.post._id;

    // Register another user
    await request(app).post("/register").send({
      username: "AnotherUser",
      email: "another@example.com",
      password: "123456",
    });
    const login2 = await request(app).post("/login").send({
      email: "another@example.com",
      password: "123456",
    });

    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${login2.body.token}`);

    expect(res.statusCode).toBe(403);
  });

  test("should return 400 for invalid post ID format", async () => {
    const res = await request(app).get("/posts/invalidid");
    expect(res.statusCode).toBe(400);
  });
});
