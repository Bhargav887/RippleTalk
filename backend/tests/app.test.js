const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");

let mongoServer;
let token, postId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Full Backend Test", () => {
  test("Register user", async () => {
    const res = await request(app).post("/register").send({
      username: "TestUser",
      email: "test@example.com",
      password: "123456",
    });
    if (res.statusCode !== 201) console.log("Register error:", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("email", "test@example.com");
  });

  test("Login user", async () => {
    const res = await request(app).post("/login").send({
      email: "test@example.com",
      password: "123456",
    });
    if (res.statusCode !== 200) console.log("Login error:", res.body);
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    expect(token).toBeDefined();
  });

  test("Create and delete post", async () => {
    // Create post
    const create = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "high", content: "Testing post creation" });
    if (create.statusCode !== 201) console.log("Create error:", create.body);
    expect(create.statusCode).toBe(201);
    postId = create.body.post._id;

    // Delete post
    const del = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  });
});
