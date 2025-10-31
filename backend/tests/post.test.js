// tests/post.test.js
const request = require("supertest");
const User = require("../models/user");
const app = require("../server");

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Post Routes", () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post("/register")
      .send({
        username: "Alice",
        email: `alice${Date.now()}@example.com`,
        password: "mypassword",
      });

    const loginRes = await request(app)
      .post("/login")
      .send({
        email: /alice/.test(process.env) ? process.env.TEST_EMAIL : undefined,
        // fallback — actually use the registered email above:
        email: undefined,
      });

    // more robust: get the token by logging in again
    const credentials = { email: "alice@example.com", password: "mypassword" };

    // since we registered with a timestamp email, let's log in with that same one:
    // find the created user
    const users = await request(app).get("/ripple"); // quick call to ensure DB accessible

    // login using the same unique email we registered with above
    // simpler approach: re-register with deterministic email for this beforeEach
    await request(app).post("/register").send({
      username: "AliceDet",
      email: "alice_det@example.com",
      password: "mypassword",
    });

    const lr = await request(app).post("/login").send({
      email: "alice_det@example.com",
      password: "mypassword",
    });

    token = lr.body.token;
  });

  it("should create a new post", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "high", content: "Feeling good today" });

    expect(res.statusCode).toBe(201);
    expect(res.body.post).toHaveProperty("content", "Feeling good today");
  });

  it("should fetch user’s posts", async () => {
    await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "low", content: "Bit tired today" });

    const res = await request(app)
      .get("/my-posts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should not create post without mood/content", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/mood and content/i);
  });
});
