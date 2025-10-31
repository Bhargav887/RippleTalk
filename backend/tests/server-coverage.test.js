const request = require("supertest");

describe("Server edge routes and errors", () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = "test";
    app = require("../server");
  });

  it("should return 404 for unknown route", async () => {
    const res = await request(app).get("/nonexistent-route");
    expect(res.statusCode).toBe(404);
  });

  it("should trigger error middleware gracefully", async () => {
    // Simulate error manually
    app.get("/throw-error", () => {
      throw new Error("Forced error");
    });

    const res = await request(app).get("/throw-error");
    expect(res.statusCode).toBeGreaterThanOrEqual(500);
  });

  it("should log startup messages when required again", () => {
    jest.resetModules();
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    process.env.NODE_ENV = "test";

    require("../server");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
