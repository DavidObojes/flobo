import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";
import catRouter from "./cat.js";



function makeTestApp({ dbMock, userId = "user-123" }) {
  const app = express();
  app.use(express.json());

  // Fake OAuth locals
  app.use((req, res, next) => {
    res.locals.oauth = { token: { user: { user_id: userId } } };
    next();
  });

  // Fake DB an app hängen
  app.set("db", dbMock);

  app.use("/api/cat", catRouter);
  return app;
}

describe("GET /api/cat", () => {
  test("returns only cats of logged-in user", async () => {
    const cats = [
      { _id: "1", name: "Milo", userId: "user-123" },
      { _id: "2", name: "Luna", userId: "user-123" },
    ];

    const toArray = jest.fn().mockResolvedValue(cats);
    const find = jest.fn().mockReturnValue({ toArray });
    const collection = jest.fn().mockReturnValue({ find });

    const dbMock = { collection };

    const app = makeTestApp({ dbMock, userId: "user-123" });

    const res = await request(app).get("/api/cat");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(cats);

    // Assertions auf Query
    expect(collection).toHaveBeenCalledWith("cat");
    expect(find).toHaveBeenCalledWith({ userId: "user-123" });
    expect(toArray).toHaveBeenCalled();
  });
});



describe("POST /api/cat", () => {
  test("creates a cat and forces userId + defaults", async () => {
    const insertOne = jest.fn().mockResolvedValue({
      acknowledged: true,
      insertedId: "new-id-123",
    });

    const findOne = jest.fn().mockResolvedValue({
      _id: "new-id-123",
      name: "Neko",
      userId: "user-123",
      wins: 0,
      losses: 0,
      xp: 0,
      level: 1,
    });

    const collection = jest.fn().mockReturnValue({ insertOne, findOne });
    const dbMock = { collection };

    const app = makeTestApp({ dbMock, userId: "user-123" });

    const res = await request(app)
      .post("/api/cat")
      .send({
        name: "Neko",
        userId: "evil-user",
      });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe("user-123");
    expect(res.body.level).toBe(1);
    expect(res.body.wins).toBe(0);

    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Neko",
        userId: "user-123",
        wins: 0,
        losses: 0,
        xp: 0,
        level: 1,
      })
    );

    expect(findOne).toHaveBeenCalledWith({ _id: "new-id-123" });
  });
});
