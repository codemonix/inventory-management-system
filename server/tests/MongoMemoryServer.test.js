import mongoose from "mongoose";

describe(" MongoMemoryServer Integrity Check", () => {
  test("should connect and return a database name", () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    expect(mongoose.connection.db.databaseName).toBeTruthy();
  });

  test("should be using the in-memory URI", () => {
    const uri = mongoose.connection.client.s.url;
    expect(uri).toContain("127.0.0.1");
  });

  test("should be able to write and read a dummy document", async () => {
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model("TestModel", TestSchema);

    await TestModel.create({ name: "MongoMem" });
    const fetched = await TestModel.findOne({ name: "MongoMem" });

    expect(fetched).not.toBeNull();
    expect(fetched.name).toBe("MongoMem");
  });
});
