/* eslint-disable prettier/prettier */
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import request from "supertest";
import UserFactory from "../../user/model/user.factory.js";
import DeliveryNoteFactory from "../model/deliveryNote.factory.js";
import SalesInvoiceFactory from "../model/salesInvoice.factory.js";
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

describe("retrieve all Sales Report", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 retrieve all Sales Report failed because user is not login yet", async () => {
    const app = await createApp();

    const response = await request(app).get("/v1/salesReports");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 retrieve all Sales Report failed, dont have permission", async () => {
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
      .get("/v1/salesReports")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 retrieve all Sales Report success", async () => {
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

    const deliveryNoteFactory = new DeliveryNoteFactory();
    const deliveryNoteResult = await deliveryNoteFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[0],
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[1],
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[2],
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const response = await request(app)
      .get("/v1/salesReports")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const deliveryNoteRecord = await retrieveAll("deliveryNotes");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReports[0]._id);
    expect(salesInvoiceRecord[0].productCode).toStrictEqual(response.body.salesReports[0].productCode);
    expect(deliveryNoteRecord[0].warehouse).toStrictEqual(response.body.salesReports[0].warehouse);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.salesReports[0].description);
    expect(salesInvoiceRecord[0].principle).toStrictEqual(response.body.salesReports[0].principle);
    expect(salesInvoiceRecord[0].totalInvoiced).toStrictEqual(response.body.salesReports[0].totalInvoiced);
    expect(salesInvoiceRecord[0].totalBeforeDiscount).toStrictEqual(response.body.salesReports[0].totalBeforeDiscount);
    expect(salesInvoiceRecord[0].item).toStrictEqual(response.body.salesReports[0].item);
    expect(salesInvoiceRecord[0].totalDiscount).toStrictEqual(response.body.salesReports[0].totalDiscount);
    expect(salesInvoiceRecord[0].totalAfterDiscount).toStrictEqual(response.body.salesReports[0].totalAfterDiscount);
    expect(salesInvoiceRecord[0].totalTax).toStrictEqual(response.body.salesReports[0].totalTax);
    expect(salesInvoiceRecord[0].totalAfterTax).toStrictEqual(response.body.salesReports[0].totalAfterTax);
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReports[1]._id);
    expect(salesInvoiceRecord[1].productCode).toStrictEqual(response.body.salesReports[1].productCode);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReports[2]._id);
    expect(salesInvoiceRecord[2].productCode).toStrictEqual(response.body.salesReports[2].productCode);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(3);
    // check database
  });
  it("1.4 retrieve all Sales Report success, with filter date", async () => {
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

    const deliveryNoteFactory = new DeliveryNoteFactory();
    const deliveryNoteResult = await deliveryNoteFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[0],
        dateInvoice: "2022-01-01",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[1],
        dateInvoice: "2021-01-01",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[2],
        dateInvoice: "2023-01-01",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";

    const response = await request(app)
      .get(`/v1/salesReports?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const deliveryNoteRecord = await retrieveAll("deliveryNotes");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReports[0]._id);
    expect(salesInvoiceRecord[0].productCode).toStrictEqual(response.body.salesReports[0].productCode);
    expect(deliveryNoteRecord[0].warehouse).toStrictEqual(response.body.salesReports[0].warehouse);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.salesReports[0].description);
    expect(salesInvoiceRecord[0].principle).toStrictEqual(response.body.salesReports[0].principle);
    expect(salesInvoiceRecord[0].totalInvoiced).toStrictEqual(response.body.salesReports[0].totalInvoiced);
    expect(salesInvoiceRecord[0].totalBeforeDiscount).toStrictEqual(response.body.salesReports[0].totalBeforeDiscount);
    expect(salesInvoiceRecord[0].item).toStrictEqual(response.body.salesReports[0].item);
    expect(salesInvoiceRecord[0].totalDiscount).toStrictEqual(response.body.salesReports[0].totalDiscount);
    expect(salesInvoiceRecord[0].totalAfterDiscount).toStrictEqual(response.body.salesReports[0].totalAfterDiscount);
    expect(salesInvoiceRecord[0].totalTax).toStrictEqual(response.body.salesReports[0].totalTax);
    expect(salesInvoiceRecord[0].totalAfterTax).toStrictEqual(response.body.salesReports[0].totalAfterTax);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReports[1]._id);
    expect(salesInvoiceRecord[2].productCode).toStrictEqual(response.body.salesReports[1].productCode);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.5 retrieve all Sales Report success, with filter item", async () => {
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

    const deliveryNoteFactory = new DeliveryNoteFactory();
    const deliveryNoteResult = await deliveryNoteFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[0],
        item: "item A",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[1],
        item: "item B",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[2],
        item: "item B",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterItem = "item B";

    const response = await request(app)
      .get(`/v1/salesReports?filter[item]=${encodeURI(filterItem)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const deliveryNoteRecord = await retrieveAll("deliveryNotes");
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReports[0]._id);
    expect(salesInvoiceRecord[1].productCode).toStrictEqual(response.body.salesReports[0].productCode);
    expect(deliveryNoteRecord[1].warehouse).toStrictEqual(response.body.salesReports[0].warehouse);
    expect(salesInvoiceRecord[1].description).toStrictEqual(response.body.salesReports[0].description);
    expect(salesInvoiceRecord[1].principle).toStrictEqual(response.body.salesReports[0].principle);
    expect(salesInvoiceRecord[1].totalInvoiced).toStrictEqual(response.body.salesReports[0].totalInvoiced);
    expect(salesInvoiceRecord[1].totalBeforeDiscount).toStrictEqual(response.body.salesReports[0].totalBeforeDiscount);
    expect(salesInvoiceRecord[1].item).toStrictEqual(response.body.salesReports[0].item);
    expect(salesInvoiceRecord[1].totalDiscount).toStrictEqual(response.body.salesReports[0].totalDiscount);
    expect(salesInvoiceRecord[1].totalAfterDiscount).toStrictEqual(response.body.salesReports[0].totalAfterDiscount);
    expect(salesInvoiceRecord[1].totalTax).toStrictEqual(response.body.salesReports[0].totalTax);
    expect(salesInvoiceRecord[1].totalAfterTax).toStrictEqual(response.body.salesReports[0].totalAfterTax);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReports[1]._id);
    expect(salesInvoiceRecord[2].productCode).toStrictEqual(response.body.salesReports[1].productCode);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.6 retrieve all Sales Report success, with filter warehouse", async () => {
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

    const deliveryNoteFactory = new DeliveryNoteFactory();
    const deliveryNoteResult = await deliveryNoteFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[0],
        warehouse: "warehouse A",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[1],
        warehouse: "warehouse A",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[2],
        warehouse: "warehouse B",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterWarehouse = "warehouse A";

    const response = await request(app)
      .get(`/v1/salesReports?filter[warehouse]=${encodeURI(filterWarehouse)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const deliveryNoteRecord = await retrieveAll("deliveryNotes");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReports[0]._id);
    expect(salesInvoiceRecord[0].productCode).toStrictEqual(response.body.salesReports[0].productCode);
    expect(deliveryNoteRecord[0].warehouse).toStrictEqual(response.body.salesReports[0].warehouse);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.salesReports[0].description);
    expect(salesInvoiceRecord[0].principle).toStrictEqual(response.body.salesReports[0].principle);
    expect(salesInvoiceRecord[0].totalInvoiced).toStrictEqual(response.body.salesReports[0].totalInvoiced);
    expect(salesInvoiceRecord[0].totalBeforeDiscount).toStrictEqual(response.body.salesReports[0].totalBeforeDiscount);
    expect(salesInvoiceRecord[0].item).toStrictEqual(response.body.salesReports[0].item);
    expect(salesInvoiceRecord[0].totalDiscount).toStrictEqual(response.body.salesReports[0].totalDiscount);
    expect(salesInvoiceRecord[0].totalAfterDiscount).toStrictEqual(response.body.salesReports[0].totalAfterDiscount);
    expect(salesInvoiceRecord[0].totalTax).toStrictEqual(response.body.salesReports[0].totalTax);
    expect(salesInvoiceRecord[0].totalAfterTax).toStrictEqual(response.body.salesReports[0].totalAfterTax);
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReports[1]._id);
    expect(salesInvoiceRecord[1].productCode).toStrictEqual(response.body.salesReports[1].productCode);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.7 retrieve all Sales Report success, with filter date, item, and warehouse", async () => {
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

    const deliveryNoteFactory = new DeliveryNoteFactory();
    const deliveryNoteResult = await deliveryNoteFactory.createMany(4);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[0],
        dateInvoice: "2022-01-01",
        item: "item B",
        warehouse: "warehouse A",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[1],
        dateInvoice: "2021-01-01",
        item: "item B",
        warehouse: "warehouse A",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[2],
        dateInvoice: "2023-01-01",
        item: "item A",
        warehouse: "warehouse A",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[3],
        dateInvoice: "2023-01-01",
        item: "item B",
        warehouse: "warehouse B",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(4);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";
    const filterItem = "Item B";
    const filterWarehouse = "Warehouse A";

    const response = await request(app)
      .get(
        `/v1/salesReports?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}&filter[item]=${encodeURI(filterItem)}&filter[warehouse]=${encodeURI(filterWarehouse)}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const deliveryNoteRecord = await retrieveAll("deliveryNotes");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReports[0]._id);
    expect(salesInvoiceRecord[0].productCode).toStrictEqual(response.body.salesReports[0].productCode);
    expect(deliveryNoteRecord[0].warehouse).toStrictEqual(response.body.salesReports[0].warehouse);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.salesReports[0].description);
    expect(salesInvoiceRecord[0].principle).toStrictEqual(response.body.salesReports[0].principle);
    expect(salesInvoiceRecord[0].totalInvoiced).toStrictEqual(response.body.salesReports[0].totalInvoiced);
    expect(salesInvoiceRecord[0].totalBeforeDiscount).toStrictEqual(response.body.salesReports[0].totalBeforeDiscount);
    expect(salesInvoiceRecord[0].item).toStrictEqual(response.body.salesReports[0].item);
    expect(salesInvoiceRecord[0].totalDiscount).toStrictEqual(response.body.salesReports[0].totalDiscount);
    expect(salesInvoiceRecord[0].totalAfterDiscount).toStrictEqual(response.body.salesReports[0].totalAfterDiscount);
    expect(salesInvoiceRecord[0].totalTax).toStrictEqual(response.body.salesReports[0].totalTax);
    expect(salesInvoiceRecord[0].totalAfterTax).toStrictEqual(response.body.salesReports[0].totalAfterTax);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(1);
    // check database
  });
  it("1.8 retrieve all Sales Report success, with search item", async () => {
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

    const deliveryNoteFactory = new DeliveryNoteFactory();
    const deliveryNoteResult = await deliveryNoteFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[0],
        item: "item bukan ABC",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[1],
        item: "item ABC",
      },
      {
        deliveryNotesID: deliveryNoteResult.insertedIds[2],
        item: "item ABC juga",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const searchItem = "item ABC";

    const response = await request(app)
      .get(`/v1/salesReports?search[item]=${encodeURI(searchItem)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const deliveryNoteRecord = await retrieveAll("deliveryNotes");
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReports[0]._id);
    expect(salesInvoiceRecord[1].productCode).toStrictEqual(response.body.salesReports[0].productCode);
    expect(deliveryNoteRecord[1].warehouse).toStrictEqual(response.body.salesReports[0].warehouse);
    expect(salesInvoiceRecord[1].description).toStrictEqual(response.body.salesReports[0].description);
    expect(salesInvoiceRecord[1].principle).toStrictEqual(response.body.salesReports[0].principle);
    expect(salesInvoiceRecord[1].totalInvoiced).toStrictEqual(response.body.salesReports[0].totalInvoiced);
    expect(salesInvoiceRecord[1].totalBeforeDiscount).toStrictEqual(response.body.salesReports[0].totalBeforeDiscount);
    expect(salesInvoiceRecord[1].item).toStrictEqual(response.body.salesReports[0].item);
    expect(salesInvoiceRecord[1].totalDiscount).toStrictEqual(response.body.salesReports[0].totalDiscount);
    expect(salesInvoiceRecord[1].totalAfterDiscount).toStrictEqual(response.body.salesReports[0].totalAfterDiscount);
    expect(salesInvoiceRecord[1].totalTax).toStrictEqual(response.body.salesReports[0].totalTax);
    expect(salesInvoiceRecord[1].totalAfterTax).toStrictEqual(response.body.salesReports[0].totalAfterTax);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReports[1]._id);
    expect(salesInvoiceRecord[2].productCode).toStrictEqual(response.body.salesReports[1].productCode);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
});
