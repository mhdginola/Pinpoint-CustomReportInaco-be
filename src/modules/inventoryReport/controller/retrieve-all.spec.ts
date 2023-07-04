/* eslint-disable prettier/prettier */
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import request from "supertest";
import UserFactory from "../../user/model/user.factory.js";
import InventoryReportFactory from "../model/inventoryReport.factory.js";
import { createApp } from "@src/app.js";
import { resetDatabase, retrieveAll } from "@src/test/utils.js";

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

describe("retrieve all Invertory Report", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 retrieve all Invertory Report failed because user is not login yet", async () => {
    const app = await createApp();

    const inventoryReportFactory = new InventoryReportFactory();
    await inventoryReportFactory.createMany(3);

    const response = await request(app).get("/v1/inventoryReports");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 retrieve all Invertory Report failed, dont have permission", async () => {
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

    const inventoryReportFactory = new InventoryReportFactory();
    await inventoryReportFactory.createMany(3);

    const response = await request(app)
      .get("/v1/inventoryReports")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 retrieve all Invertory Report success", async () => {
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

    const inventoryReportFactory = new InventoryReportFactory();
    await inventoryReportFactory.createMany(3);

    const response = await request(app)
      .get("/v1/inventoryReports")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const inventoryReportRecord = await retrieveAll("inventoryReports");
    expect(inventoryReportRecord[0]._id).toStrictEqual(response.body.inventoryReports[0]._id);
    expect(inventoryReportRecord[0].item).toStrictEqual(response.body.inventoryReports[0].item);
    expect(inventoryReportRecord[0].description).toStrictEqual(response.body.inventoryReports[0].description);
    expect(inventoryReportRecord[0].quantityInStock).toStrictEqual(response.body.inventoryReports[0].quantityInStock);
    expect(inventoryReportRecord[0].issuesQuantity).toStrictEqual(response.body.inventoryReports[0].issuesQuantity);
    expect(inventoryReportRecord[0].unitCost).toStrictEqual(response.body.inventoryReports[0].unitCost);
    expect(inventoryReportRecord[0].startBalanceCost).toStrictEqual(response.body.inventoryReports[0].startBalanceCost);
    expect(inventoryReportRecord[0].receiptsAmount).toStrictEqual(response.body.inventoryReports[0].receiptsAmount);
    expect(inventoryReportRecord[0].issuesAmount).toStrictEqual(response.body.inventoryReports[0].issuesAmount);
    expect(inventoryReportRecord[1]._id).toStrictEqual(response.body.inventoryReports[1]._id);
    expect(inventoryReportRecord[1].item).toStrictEqual(response.body.inventoryReports[1].item);
    expect(inventoryReportRecord[2]._id).toStrictEqual(response.body.inventoryReports[2]._id);
    expect(inventoryReportRecord[2].item).toStrictEqual(response.body.inventoryReports[2].item);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(3);
    // check database
  });
  it("1.4 retrieve all Invertory Report success, with filter date", async () => {
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

    const inventoryReportFactory = new InventoryReportFactory();
    const data = [
      {
        createdAt: "2022-01-01",
      },
      {
        createdAt: "2021-01-01",
      },
      {
        createdAt: "2023-01-01",
      },
    ];
    inventoryReportFactory.sequence(data);
    await inventoryReportFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";

    const response = await request(app)
      .get(`/v1/inventoryReports?filter[dateFrom]=${filterDateFrom}&filter[dateTo]=${filterDateTo}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const inventoryReportRecord = await retrieveAll("inventoryReports");
    expect(inventoryReportRecord[0]._id).toStrictEqual(response.body.inventoryReports[0]._id);
    expect(inventoryReportRecord[0].item).toStrictEqual(response.body.inventoryReports[0].item);
    expect(inventoryReportRecord[0].description).toStrictEqual(response.body.inventoryReports[0].description);
    expect(inventoryReportRecord[0].quantityInStock).toStrictEqual(response.body.inventoryReports[0].quantityInStock);
    expect(inventoryReportRecord[0].issuesQuantity).toStrictEqual(response.body.inventoryReports[0].issuesQuantity);
    expect(inventoryReportRecord[0].unitCost).toStrictEqual(response.body.inventoryReports[0].unitCost);
    expect(inventoryReportRecord[0].startBalanceCost).toStrictEqual(response.body.inventoryReports[0].startBalanceCost);
    expect(inventoryReportRecord[0].receiptsAmount).toStrictEqual(response.body.inventoryReports[0].receiptsAmount);
    expect(inventoryReportRecord[0].issuesAmount).toStrictEqual(response.body.inventoryReports[0].issuesAmount);
    expect(inventoryReportRecord[2]._id).toStrictEqual(response.body.inventoryReports[1]._id);
    expect(inventoryReportRecord[2].item).toStrictEqual(response.body.inventoryReports[1].item);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.5 retrieve all Invertory Report success, with filter item", async () => {
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

    const inventoryReportFactory = new InventoryReportFactory();
    const data = [
      {
        item: "item A",
      },
      {
        item: "item B",
      },
      {
        item: "item B",
      },
    ];
    inventoryReportFactory.sequence(data);
    await inventoryReportFactory.createMany(3);

    const filterItem = "item B";

    const response = await request(app)
      .get(`/v1/inventoryReports?filter[item]=${filterItem}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const inventoryReportRecord = await retrieveAll("inventoryReports");
    expect(inventoryReportRecord[1]._id).toStrictEqual(response.body.inventoryReports[0]._id);
    expect(inventoryReportRecord[1].item).toStrictEqual(response.body.inventoryReports[0].item);
    expect(inventoryReportRecord[1].description).toStrictEqual(response.body.inventoryReports[0].description);
    expect(inventoryReportRecord[1].quantityInStock).toStrictEqual(response.body.inventoryReports[0].quantityInStock);
    expect(inventoryReportRecord[1].issuesQuantity).toStrictEqual(response.body.inventoryReports[0].issuesQuantity);
    expect(inventoryReportRecord[1].unitCost).toStrictEqual(response.body.inventoryReports[0].unitCost);
    expect(inventoryReportRecord[1].startBalanceCost).toStrictEqual(response.body.inventoryReports[0].startBalanceCost);
    expect(inventoryReportRecord[1].receiptsAmount).toStrictEqual(response.body.inventoryReports[0].receiptsAmount);
    expect(inventoryReportRecord[1].issuesAmount).toStrictEqual(response.body.inventoryReports[0].issuesAmount);
    expect(inventoryReportRecord[2]._id).toStrictEqual(response.body.inventoryReports[1]._id);
    expect(inventoryReportRecord[2].item).toStrictEqual(response.body.inventoryReports[1].item);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.6 retrieve all Invertory Report success, with filter date and item", async () => {
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

    const inventoryReportFactory = new InventoryReportFactory();
    const data = [
      {
        createdAt: "2022-01-01",
        item: "item B",
      },
      {
        createdAt: "2021-01-01",
        item: "item B",
      },
      {
        createdAt: "2023-01-01",
        item: "item A",
      },
    ];
    inventoryReportFactory.sequence(data);
    await inventoryReportFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";
    const filterItem = "Item B";

    const response = await request(app)
      .get(
        `/v1/inventoryReports?filter[dateFrom]=${filterDateFrom}&filter[dateTo]=${filterDateTo}&filter[item]=${filterItem}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const inventoryReportRecord = await retrieveAll("inventoryReports");
    expect(inventoryReportRecord[0]._id).toStrictEqual(response.body.inventoryReports[0]._id);
    expect(inventoryReportRecord[0].item).toStrictEqual(response.body.inventoryReports[0].item);
    expect(inventoryReportRecord[0].description).toStrictEqual(response.body.inventoryReports[0].description);
    expect(inventoryReportRecord[0].quantityInStock).toStrictEqual(response.body.inventoryReports[0].quantityInStock);
    expect(inventoryReportRecord[0].issuesQuantity).toStrictEqual(response.body.inventoryReports[0].issuesQuantity);
    expect(inventoryReportRecord[0].unitCost).toStrictEqual(response.body.inventoryReports[0].unitCost);
    expect(inventoryReportRecord[0].startBalanceCost).toStrictEqual(response.body.inventoryReports[0].startBalanceCost);
    expect(inventoryReportRecord[0].receiptsAmount).toStrictEqual(response.body.inventoryReports[0].receiptsAmount);
    expect(inventoryReportRecord[0].issuesAmount).toStrictEqual(response.body.inventoryReports[0].issuesAmount);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(1);
    // check database
  });
  it("1.7 retrieve all Invertory Report success, with search item", async () => {
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

    const inventoryReportFactory = new InventoryReportFactory();
    const data = [
      {
        item: "item bukan ABC",
      },
      {
        item: "item ABC",
      },
      {
        item: "item ABC juga",
      },
    ];
    inventoryReportFactory.sequence(data);
    await inventoryReportFactory.createMany(3);

    const searchItem = "item ABC";

    const response = await request(app)
      .get(`/v1/inventoryReports?search[item]=${searchItem}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const inventoryReportRecord = await retrieveAll("inventoryReports");
    expect(inventoryReportRecord[1]._id).toStrictEqual(response.body.inventoryReports[0]._id);
    expect(inventoryReportRecord[1].item).toStrictEqual(response.body.inventoryReports[0].item);
    expect(inventoryReportRecord[1].description).toStrictEqual(response.body.inventoryReports[0].description);
    expect(inventoryReportRecord[1].quantityInStock).toStrictEqual(response.body.inventoryReports[0].quantityInStock);
    expect(inventoryReportRecord[1].issuesQuantity).toStrictEqual(response.body.inventoryReports[0].issuesQuantity);
    expect(inventoryReportRecord[1].unitCost).toStrictEqual(response.body.inventoryReports[0].unitCost);
    expect(inventoryReportRecord[1].startBalanceCost).toStrictEqual(response.body.inventoryReports[0].startBalanceCost);
    expect(inventoryReportRecord[1].receiptsAmount).toStrictEqual(response.body.inventoryReports[0].receiptsAmount);
    expect(inventoryReportRecord[1].issuesAmount).toStrictEqual(response.body.inventoryReports[0].issuesAmount);
    expect(inventoryReportRecord[2]._id).toStrictEqual(response.body.inventoryReports[1]._id);
    expect(inventoryReportRecord[2].item).toStrictEqual(response.body.inventoryReports[1].item);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
});
