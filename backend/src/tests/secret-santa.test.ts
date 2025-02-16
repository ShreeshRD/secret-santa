import request from "supertest";
import app from "../app";
import fs from "fs";
import path from "path";

describe("POST /api/secret-santa", () => {
  const testFilesDir = path.join(__dirname, "test-files");

  beforeAll(() => {
    // Create test files directory
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir);
    }
  });

  afterAll(() => {
    // Cleanup test files directory
    if (fs.existsSync(testFilesDir)) {
      fs.rmSync(testFilesDir, { recursive: true });
    }
  });

  describe("Successful pair generation", () => {
    it("should generate pairs with no previous pairings", async () => {
      const currentParticipants = path.join(testFilesDir, "current1.csv");
      const previousPairings = path.join(testFilesDir, "previous1.csv");

      fs.writeFileSync(
        currentParticipants,
        `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com
Charlie,charlie@example.com`
      );

      fs.writeFileSync(
        previousPairings,
        `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID\n`
      ); // Empty valid CSV

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", currentParticipants)
        .attach("previousPairings", previousPairings);

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/text\/csv/);
      expect(response.text).toMatch(
        /"?Employee_Name"?,"?Employee_EmailID"?,"?Secret_Child_Name"?,"?Secret_Child_EmailID"?/
      );
    });

    it("should avoid previous pairings", async () => {
      const currentParticipants = path.join(testFilesDir, "current2.csv");
      const previousPairings = path.join(testFilesDir, "previous2.csv");

      fs.writeFileSync(
        currentParticipants,
        `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com
Charlie,charlie@example.com`
      );

      fs.writeFileSync(
        previousPairings,
        `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID
Alice,alice@example.com,Bob,bob@example.com`
      );

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", currentParticipants)
        .attach("previousPairings", previousPairings);

      const csvData = response.text;
      const aliceLine = csvData
        .split("\n")
        .find((line) => line.includes("alice@example.com"));
      expect(aliceLine).not.toContain("bob@example.com");
    });
  });

  describe("Input validation", () => {
    it("should reject request with only one file", async () => {
      const currentParticipants = path.join(testFilesDir, "current3.csv");
      fs.writeFileSync(
        currentParticipants,
        `Employee_Name,Employee_EmailID\nAlice,alice@example.com\nBob,bob@example.com`
      );

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", currentParticipants);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Both files are required/);
    });

    it("should reject invalid CSV format", async () => {
      const invalidFile = path.join(testFilesDir, "invalid.csv");
      fs.writeFileSync(invalidFile, "Invalid data\nno,headers");

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", invalidFile)
        .attach("previousPairings", invalidFile);

      expect(response.status).toBe(400);
    });

    it("should reject files with missing headers", async () => {
      const badFile = path.join(testFilesDir, "bad.csv");
      fs.writeFileSync(badFile, "Name,Email\nAlice,alice@example.com");

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", badFile)
        .attach("previousPairings", badFile);

      expect(response.status).toBe(400);
    });
  });

  describe("Edge cases", () => {
    it("should handle minimum participants (2)", async () => {
      const currentParticipants = path.join(testFilesDir, "current4.csv");
      const previousPairings = path.join(testFilesDir, "previous4.csv");

      fs.writeFileSync(
        currentParticipants,
        `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com`
      );

      fs.writeFileSync(
        previousPairings,
        `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID`
      );

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", currentParticipants)
        .attach("previousPairings", previousPairings);

      expect(response.status).toBe(200);
      const pairs = response.text
        .split("\n")
        .slice(1)
        .filter((l) => l);
      expect(pairs).toHaveLength(2);
    });

    it("should reject insufficient participants (<2)", async () => {
      const currentParticipants = path.join(testFilesDir, "current5.csv");
      const previousPairings = path.join(testFilesDir, "previous5.csv");

      fs.writeFileSync(
        currentParticipants,
        `Employee_Name,Employee_EmailID\nLonely,lonely@example.com`
      );
      fs.writeFileSync(
        previousPairings,
        `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID`
      );

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", currentParticipants)
        .attach("previousPairings", previousPairings);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/At least 2 participants required/);
    });
  });

  describe("Conflict resolution", () => {
    it("should handle complete constraint conflicts", async () => {
      const currentParticipants = path.join(testFilesDir, "current6.csv");
      const previousPairings = path.join(testFilesDir, "previous6.csv");

      // Only 2 participants who were previously paired
      fs.writeFileSync(
        currentParticipants,
        `Employee_Name,Employee_EmailID
Alice,alice@example.com
Bob,bob@example.com`
      );

      fs.writeFileSync(
        previousPairings,
        `Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID
Alice,alice@example.com,Bob,bob@example.com
Bob,bob@example.com,Alice,alice@example.com`
      );

      const response = await request(app)
        .post("/api/secret-santa")
        .attach("currentParticipants", currentParticipants)
        .attach("previousPairings", previousPairings);

      // This should fail as no valid derangement possible
      expect(response.status).toBe(500);
      expect(response.body.details).toMatch(/Failed to generate valid pairs/);
    });
  });
});
