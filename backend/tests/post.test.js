const request = require("supertest");
let app;

beforeAll(() => {
  app = require("../server");
});

describe("Post Routes", () => {
  let token;

  beforeEach(async () => {
    await request(app).post("/register").send({
      username: "Alice",
      email: "alice@example.com",
      password: "mypassword",
    });

    const loginRes = await request(app).post("/login").send({
      email: "alice@example.com",
      password: "mypassword",
    });

    token = loginRes.body.token;
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
  });
});
