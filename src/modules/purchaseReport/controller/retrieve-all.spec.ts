/* eslint-disable prettier/prettier */
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import request from "supertest";
import UserFactory from "../../user/model/user.factory.js";
import PurchaseInvoiceFactory from "../model/purchaseInvoice.factory.js";
import PurchaseReceiveFactory from "../model/purchaseReceive.factory.js";
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

describe("retrieve all Purchase Report", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 retrieve all Purchase Report failed because user is not login yet", async () => {
    const app = await createApp();

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    await purchaseInvoiceFactory.createMany(3);

    const response = await request(app).get("/v1/purchaseReports");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 retrieve all Purchase Report failed, dont have permission", async () => {
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

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    await purchaseInvoiceFactory.createMany(3);

    const response = await request(app)
      .get("/v1/purchaseReports")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 retrieve all Purchase Report success", async () => {
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

    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const response = await request(app)
      .get("/v1/purchaseReports")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoiceRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceiveRecord = await retrieveAll("purchaseReceives");
    expect(purchaseInvoiceRecord[0]._id).toStrictEqual(response.body.purchaseReports[0]._id);
    expect(purchaseInvoiceRecord[0].noBukti).toStrictEqual(response.body.purchaseReports[0].noBukti);
    expect(purchaseInvoiceRecord[0].dateInvoice).toStrictEqual(response.body.purchaseReports[0].dateInvoice);
    expect(purchaseInvoiceRecord[0].purchaseInvoice).toStrictEqual(response.body.purchaseReports[0].purchaseInvoice);
    expect(purchaseInvoiceRecord[0].supplier).toStrictEqual(response.body.purchaseReports[0].supplier);
    expect(purchaseInvoiceRecord[0].noFaktur).toStrictEqual(response.body.purchaseReports[0].noFaktur);
    expect(purchaseReceiveRecord[0].noSuratJalan).toStrictEqual(response.body.purchaseReports[0].purchaseReceive.noSuratJalan);
    expect(purchaseInvoiceRecord[0].noFakturPajak).toStrictEqual(response.body.purchaseReports[0].noFakturPajak);
    expect(purchaseInvoiceRecord[0].dpp).toStrictEqual(response.body.purchaseReports[0].dpp);
    expect(purchaseInvoiceRecord[0].ppn).toStrictEqual(response.body.purchaseReports[0].ppn);
    expect(purchaseInvoiceRecord[0].total).toStrictEqual(response.body.purchaseReports[0].total);
    expect(purchaseInvoiceRecord[1]._id).toStrictEqual(response.body.purchaseReports[1]._id);
    expect(purchaseInvoiceRecord[1].noBukti).toStrictEqual(response.body.purchaseReports[1].noBukti);
    expect(purchaseInvoiceRecord[2]._id).toStrictEqual(response.body.purchaseReports[2]._id);
    expect(purchaseInvoiceRecord[2].noBukti).toStrictEqual(response.body.purchaseReports[2].noBukti);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(3);
    // check database
  });
  it("1.4 retrieve all Purchase Report success, with filter date", async () => {
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

    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        dateInvoice: "2022-01-01",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        dateInvoice: "2021-01-01",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        dateInvoice: "2023-01-01",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";

    const response = await request(app)
      .get(
        `/v1/purchaseReports?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoiceRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceiveRecord = await retrieveAll("purchaseReceives");
    expect(purchaseInvoiceRecord[0]._id).toStrictEqual(response.body.purchaseReports[0]._id);
    expect(purchaseInvoiceRecord[0].noBukti).toStrictEqual(response.body.purchaseReports[0].noBukti);
    expect(purchaseInvoiceRecord[0].dateInvoice).toStrictEqual(response.body.purchaseReports[0].dateInvoice);
    expect(purchaseInvoiceRecord[0].purchaseInvoice).toStrictEqual(response.body.purchaseReports[0].purchaseInvoice);
    expect(purchaseInvoiceRecord[0].supplier).toStrictEqual(response.body.purchaseReports[0].supplier);
    expect(purchaseInvoiceRecord[0].noFaktur).toStrictEqual(response.body.purchaseReports[0].noFaktur);
    expect(purchaseReceiveRecord[0].noSuratJalan).toStrictEqual(response.body.purchaseReports[0].purchaseReceive.noSuratJalan);
    expect(purchaseInvoiceRecord[0].noFakturPajak).toStrictEqual(response.body.purchaseReports[0].noFakturPajak);
    expect(purchaseInvoiceRecord[0].dpp).toStrictEqual(response.body.purchaseReports[0].dpp);
    expect(purchaseInvoiceRecord[0].ppn).toStrictEqual(response.body.purchaseReports[0].ppn);
    expect(purchaseInvoiceRecord[0].total).toStrictEqual(response.body.purchaseReports[0].total);
    expect(purchaseInvoiceRecord[2]._id).toStrictEqual(response.body.purchaseReports[1]._id);
    expect(purchaseInvoiceRecord[2].noBukti).toStrictEqual(response.body.purchaseReports[1].noBukti);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);

    // validate filter
    response.body.purchaseReports.forEach((element:any) => {
      expect((new Date(element.dateInvoice)).getTime()).toBeGreaterThanOrEqual((new Date(filterDateFrom).getTime()));
      expect((new Date(element.dateInvoice)).getTime()).toBeLessThanOrEqual((new Date(filterDateTo).getTime()));
    });
    // check database
  });
  it("1.5 retrieve all Purchase Report success, with filter supplier", async () => {
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

    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        supplier: "PT bukan ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        supplier: "PT ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        supplier: "PT ABC",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterSupplier = "PT ABC";

    const response = await request(app)
      .get(`/v1/purchaseReports?filter[supplier]=${encodeURI(filterSupplier)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoiceRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceiveRecord = await retrieveAll("purchaseReceives");
    expect(purchaseInvoiceRecord[1]._id).toStrictEqual(response.body.purchaseReports[0]._id);
    expect(purchaseInvoiceRecord[1].noBukti).toStrictEqual(response.body.purchaseReports[0].noBukti);
    expect(purchaseInvoiceRecord[1].dateInvoice).toStrictEqual(response.body.purchaseReports[0].dateInvoice);
    expect(purchaseInvoiceRecord[1].purchaseInvoice).toStrictEqual(response.body.purchaseReports[0].purchaseInvoice);
    expect(purchaseInvoiceRecord[1].supplier).toStrictEqual(response.body.purchaseReports[0].supplier);
    expect(purchaseInvoiceRecord[1].noFaktur).toStrictEqual(response.body.purchaseReports[0].noFaktur);
    expect(purchaseReceiveRecord[1].noSuratJalan).toStrictEqual(response.body.purchaseReports[0].purchaseReceive.noSuratJalan);
    expect(purchaseInvoiceRecord[1].noFakturPajak).toStrictEqual(response.body.purchaseReports[0].noFakturPajak);
    expect(purchaseInvoiceRecord[1].dpp).toStrictEqual(response.body.purchaseReports[0].dpp);
    expect(purchaseInvoiceRecord[1].ppn).toStrictEqual(response.body.purchaseReports[0].ppn);
    expect(purchaseInvoiceRecord[1].total).toStrictEqual(response.body.purchaseReports[0].total);
    expect(purchaseInvoiceRecord[2]._id).toStrictEqual(response.body.purchaseReports[1]._id);
    expect(purchaseInvoiceRecord[2].noBukti).toStrictEqual(response.body.purchaseReports[1].noBukti);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // validate filter
    response.body.purchaseReports.forEach((element:any) => {
      expect(element.supplier).toStrictEqual(filterSupplier);
    });
    // check database
  });
  it("1.6 retrieve all Purchase Report success, with filter date and supplier", async () => {
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

    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        dateInvoice: "2022-01-01",
        supplier: "PT ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        dateInvoice: "2021-01-01",
        supplier: "PT ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        dateInvoice: "2023-01-01",
        supplier: "PT bukan ABC",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";
    const filterSupplier = "PT ABC";

    const response = await request(app)
      .get(
        `/v1/purchaseReports?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(
          filterDateTo
        )}&filter[supplier]=${encodeURI(filterSupplier)}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoiceRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceiveRecord = await retrieveAll("purchaseReceives");
    expect(purchaseInvoiceRecord[0]._id).toStrictEqual(response.body.purchaseReports[0]._id);
    expect(purchaseInvoiceRecord[0].noBukti).toStrictEqual(response.body.purchaseReports[0].noBukti);
    expect(purchaseInvoiceRecord[0].dateInvoice).toStrictEqual(response.body.purchaseReports[0].dateInvoice);
    expect(purchaseInvoiceRecord[0].purchaseInvoice).toStrictEqual(response.body.purchaseReports[0].purchaseInvoice);
    expect(purchaseInvoiceRecord[0].supplier).toStrictEqual(response.body.purchaseReports[0].supplier);
    expect(purchaseInvoiceRecord[0].noFaktur).toStrictEqual(response.body.purchaseReports[0].noFaktur);
    expect(purchaseReceiveRecord[0].noSuratJalan).toStrictEqual(response.body.purchaseReports[0].purchaseReceive.noSuratJalan);
    expect(purchaseInvoiceRecord[0].noFakturPajak).toStrictEqual(response.body.purchaseReports[0].noFakturPajak);
    expect(purchaseInvoiceRecord[0].dpp).toStrictEqual(response.body.purchaseReports[0].dpp);
    expect(purchaseInvoiceRecord[0].ppn).toStrictEqual(response.body.purchaseReports[0].ppn);
    expect(purchaseInvoiceRecord[0].total).toStrictEqual(response.body.purchaseReports[0].total);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(1);

    // validate filter
    response.body.purchaseReports.forEach((element:any) => {
      expect(element.supplier).toStrictEqual(filterSupplier);
      expect((new Date(element.dateInvoice)).getTime()).toBeGreaterThanOrEqual((new Date(filterDateFrom).getTime()));
      expect((new Date(element.dateInvoice)).getTime()).toBeLessThanOrEqual((new Date(filterDateTo).getTime()));
    });
    // check database
  });
  it("1.7 retrieve all Purchase Report success, with search supplier", async () => {
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

    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        supplier: "PT bukan ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        supplier: "PT ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        supplier: "PT ABC juga",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const searchSupplier = "PT ABC";

    const response = await request(app)
      .get(`/v1/purchaseReports?search[supplier]=${encodeURI(searchSupplier)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoiceRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceiveRecord = await retrieveAll("purchaseReceives");
    expect(purchaseInvoiceRecord[1]._id).toStrictEqual(response.body.purchaseReports[0]._id);
    expect(purchaseInvoiceRecord[1].noBukti).toStrictEqual(response.body.purchaseReports[0].noBukti);
    expect(purchaseInvoiceRecord[1].dateInvoice).toStrictEqual(response.body.purchaseReports[0].dateInvoice);
    expect(purchaseInvoiceRecord[1].purchaseInvoice).toStrictEqual(response.body.purchaseReports[0].purchaseInvoice);
    expect(purchaseInvoiceRecord[1].supplier).toStrictEqual(response.body.purchaseReports[0].supplier);
    expect(purchaseInvoiceRecord[1].noFaktur).toStrictEqual(response.body.purchaseReports[0].noFaktur);
    expect(purchaseReceiveRecord[1].noSuratJalan).toStrictEqual(response.body.purchaseReports[0].purchaseReceive.noSuratJalan);
    expect(purchaseInvoiceRecord[1].noFakturPajak).toStrictEqual(response.body.purchaseReports[0].noFakturPajak);
    expect(purchaseInvoiceRecord[1].dpp).toStrictEqual(response.body.purchaseReports[0].dpp);
    expect(purchaseInvoiceRecord[1].ppn).toStrictEqual(response.body.purchaseReports[0].ppn);
    expect(purchaseInvoiceRecord[1].total).toStrictEqual(response.body.purchaseReports[0].total);
    expect(purchaseInvoiceRecord[2]._id).toStrictEqual(response.body.purchaseReports[1]._id);
    expect(purchaseInvoiceRecord[2].noBukti).toStrictEqual(response.body.purchaseReports[1].noBukti);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);    
    // validate search
    response.body.purchaseReports.forEach((element:any) => {
      expect(element.supplier).toContain(searchSupplier);
    });
    // check database
  });
});
