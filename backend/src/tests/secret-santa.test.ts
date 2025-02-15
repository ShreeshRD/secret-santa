import request from "supertest";
import app from "../app";
import fs from "fs";
import path from "path";

describe("POST /api/secret-santa", () => {
  it("should generate Secret Santa pairs", async () => {
    const csvContent = `Employee_Name,Employee_EmailID\nAlice,alice@example.com\nBob,bob@example.com\nCharlie,charlie@example.com`;
    const filePath = path.join(__dirname, "test.csv");
    fs.writeFileSync(filePath, csvContent);

    const response = await request(app)
      .post("/api/secret-santa")
      .attach("file", filePath);

    expect(response.status).toBe(200);
    expect(response.body.pairs).toHaveLength(3);

    // Clean up the test file
    fs.unlinkSync(filePath);
  });

  it("should return an error for invalid CSV", async () => {
    const response = await request(app)
      .post("/api/secret-santa")
      .attach("file", Buffer.from("invalid data"), { filename: "test.csv" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("should return an error if no file is uploaded", async () => {
    const response = await request(app).post("/api/secret-santa");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No file uploaded");
  });
});
