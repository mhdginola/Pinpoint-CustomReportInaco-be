import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import request from "supertest";
import UserFactory from "../../user/model/user.factory.js";
import { createApp } from "@src/app.js";
import { resetDatabase } from "@src/test/utils.js";

// error message
const error401 = {
  code: 401,
  message: "Authentication credentials is invalid.",
  status: "Unauthorized",
};

const error403 = {
  code: 403,
  message: "Don't have necessary permissions for this resource.",
  status: "Forbidden",
};

describe("export purchase report details", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 export purchase report details failed because user is not login yet", async () => {
    const app = await createApp();

    const response = await request(app).get("/v1/purchaseReportDetails/export");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 export purchase report details failed, dont have permission", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        id: faker.datatype.uuid(),
        username: "admin",
        password: await hash("admin123"),
        role: "",
      },
    ];
    userFactory.sequence(userSeed);
    await userFactory.createMany(1);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const response = await request(app)
      .post("/v1/purchaseReportDetails/export")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 export purchase report details success", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        id: faker.datatype.uuid(),
        username: "admin",
        password: await hash("admin123"),
        role: "admin",
      },
    ];
    userFactory.sequence(userSeed);
    await userFactory.createMany(1);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const response = await request(app)
      .get("/v1/purchaseReportDetails/export")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    expect(response.body.downloadLink).not.toBeUndefined();
  });
});
