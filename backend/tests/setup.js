// tests/setup.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

module.exports = async () => {};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  // Ensure server.js picks this up when it tries to connect
  process.env.ATLAS_URL = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
  process.env.NODE_ENV = "test";
  // connect here so the app sees a ready connection if needed
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongo) await mongo.stop();
});
