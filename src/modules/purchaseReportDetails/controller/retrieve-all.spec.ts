/* eslint-disable prettier/prettier */
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import request from "supertest";
import UserFactory from "../../user/model/user.factory.js";
import PurchaseInvoiceFactory from "../model/purchaseInvoice.factory.js";
import PurchaseOrderFactory from "../model/purchaseOrder.factory.js";
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

describe("retrieve all Purchase Report Details", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 retrieve all Purchase Report Details failed because user is not login yet", async () => {
    const app = await createApp();

    const response = await request(app).get("/v1/purchaseReportDetails");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 retrieve all Purchase Report Details failed, dont have permission", async () => {
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
      .get("/v1/purchaseReportDetails")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 retrieve all Purchase Report Details success", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(3);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const response = await request(app)
      .get("/v1/purchaseReportDetails")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[0]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[0].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[0].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[0].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[0].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[0].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[0].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[0].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[0].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[0].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[0].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[0].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[0].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[0].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[0].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[0].total).toStrictEqual(response.body.purchaseReportDetails[0].total);
    expect(purchaseInvoicesRecord[1]._id).toStrictEqual(response.body.purchaseReportDetails[1]._id);
    expect(purchaseOrdersRecord[1].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[1].purchaseOrder.purchaseOrderNumber);
    expect(purchaseInvoicesRecord[2]._id).toStrictEqual(response.body.purchaseReportDetails[2]._id);
    expect(purchaseOrdersRecord[2].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[2].purchaseOrder.purchaseOrderNumber);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(3);
    // check database
  });
  it("1.4 retrieve all Purchase Report Details success, with filter date", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(3);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
        dateInvoice: "2022-01-01",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
        dateInvoice: "2021-01-01",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
        dateInvoice: "2023-01-01",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";

    const response = await request(app)
      .get(`/v1/purchaseReportDetails?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[0]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[0].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[0].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[0].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[0].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[0].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[0].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[0].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[0].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[0].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[0].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[0].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[0].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[0].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[0].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[0].total).toStrictEqual(response.body.purchaseReportDetails[0].total);
    expect(purchaseInvoicesRecord[2]._id).toStrictEqual(response.body.purchaseReportDetails[1]._id);
    expect(purchaseOrdersRecord[2].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[1].purchaseOrder.purchaseOrderNumber);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // validate filter
    response.body.purchaseReportDetails.forEach((element:any) => {
      expect((new Date(element.createDate)).getTime()).toBeGreaterThanOrEqual((new Date(filterDateFrom).getTime()));
      expect((new Date(element.createDate)).getTime()).toBeLessThanOrEqual((new Date(filterDateTo).getTime()));
    });
    // check database
  });
  it("1.5 retrieve all Purchase Report Details success, with filter supplier", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(3);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
        supplier: "PT bukan ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
        supplier: "PT ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
        supplier: "PT ABC",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterSupplier = "PT ABC";

    const response = await request(app)
      .get(`/v1/purchaseReportDetails?filter[supplier]=${encodeURI(filterSupplier)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[1]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[1].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[1].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[1].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[1].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[1].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[1].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[1].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[1].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[1].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[1].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[1].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[1].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[1].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[1].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[1].total).toStrictEqual(response.body.purchaseReportDetails[0].total);
    expect(purchaseInvoicesRecord[2]._id).toStrictEqual(response.body.purchaseReportDetails[1]._id);
    expect(purchaseOrdersRecord[2].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[1].purchaseOrder.purchaseOrderNumber);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);    
    // validate filter
    response.body.purchaseReportDetails.forEach((element:any) => {
      expect(element.supplier).toStrictEqual(filterSupplier);
    });
    // check database
  });
  it("1.6 retrieve all Purchase Report Details success, with filter item", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(3);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
        item: "item A",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
        item: "item B",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
        item: "item B",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterItem = "item B";

    const response = await request(app)
      .get(`/v1/purchaseReportDetails?filter[item]=${encodeURI(filterItem)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[1]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[1].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[1].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[1].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[1].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[1].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[1].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[1].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[1].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[1].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[1].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[1].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[1].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[1].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[1].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[1].total).toStrictEqual(response.body.purchaseReportDetails[0].total);
    expect(purchaseInvoicesRecord[2]._id).toStrictEqual(response.body.purchaseReportDetails[1]._id);
    expect(purchaseOrdersRecord[2].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[1].purchaseOrder.purchaseOrderNumber);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);    
    // validate filter
    response.body.purchaseReportDetails.forEach((element:any) => {
      expect(element.item).toStrictEqual(filterItem);
    });
    // check database
  });
  it("1.7 retrieve all Purchase Report Details success, with filter warehouse", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(3);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
        warehouse: "warehouse A",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
        warehouse: "warehouse A",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
        warehouse: "warehouse B",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const filterWarehouse = "warehouse A";

    const response = await request(app)
      .get(`/v1/purchaseReportDetails?filter[warehouse]=${encodeURI(filterWarehouse)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[0]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[0].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[0].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[0].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[0].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[0].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[0].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[0].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[0].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[0].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[0].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[0].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[0].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[0].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[0].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[0].total).toStrictEqual(response.body.purchaseReportDetails[0].total);
    expect(purchaseInvoicesRecord[1]._id).toStrictEqual(response.body.purchaseReportDetails[1]._id);
    expect(purchaseOrdersRecord[1].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[1].purchaseOrder.purchaseOrderNumber);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);    
    // validate filter
    response.body.purchaseReportDetails.forEach((element:any) => {
      expect(element.purchaseReceive.warehouse).toStrictEqual(filterWarehouse);
    });
    // check database
  });
  it("1.8 retrieve all Purchase Report Details success, with filter date, supplier, item, and warehouse", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(4);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(4);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
        dateInvoice: "2022-01-01",
        supplier: "PT ABC",
        item: "item B",
        warehouse: "warehouse A",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
        dateInvoice: "2021-01-01",
        supplier: "PT ABC",
        item: "item B",
        warehouse: "warehouse A",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
        dateInvoice: "2023-01-01",
        supplier: "PT bukan ABC",
        item: "item B",
        warehouse: "warehouse A",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[3],
        purchaseOrder_id: purchaseOrderResult.insertedIds[3],
        dateInvoice: "2023-01-01",
        supplier: "PT ABC",
        item: "item B",
        warehouse: "warehouse B",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(4);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";
    const filterSupplier = "PT ABC";
    const filterItem = "Item B";
    const filterWarehouse = "Warehouse A";

    const response = await request(app)
      .get(
        `/v1/purchaseReportDetails?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}&filter[supplier]=${encodeURI(filterSupplier)}&filter[item]=${encodeURI(filterItem)}&filter[warehouse]=${encodeURI(filterWarehouse)}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[0]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[0].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[0].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[0].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[0].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[0].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[0].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[0].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[0].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[0].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[0].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[0].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[0].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[0].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[0].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[0].total).toStrictEqual(response.body.purchaseReportDetails[0].total);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(1);
    // validate filter
    response.body.purchaseReportDetails.forEach((element:any) => {
      expect(element.supplier).toStrictEqual(filterSupplier);
      expect(element.item).toStrictEqual(filterItem);
      expect(element.purchaseReceive.warehouse).toStrictEqual(filterWarehouse);
      expect((new Date(element.createDate)).getTime()).toBeGreaterThanOrEqual((new Date(filterDateFrom).getTime()));
      expect((new Date(element.createDate)).getTime()).toBeLessThanOrEqual((new Date(filterDateTo).getTime()));
    });
    // check database
  });
  it("1.9 retrieve all Purchase Report Details success, with search supplier", async () => {
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

    const purchaseOrderFactory = new PurchaseOrderFactory();
    const purchaseOrderResult = await purchaseOrderFactory.createMany(3);
    const purchaseReceiveFactory = new PurchaseReceiveFactory();
    const purchaseReceiveResult = await purchaseReceiveFactory.createMany(3);

    const purchaseInvoiceFactory = new PurchaseInvoiceFactory();
    const data = [
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[0],
        purchaseOrder_id: purchaseOrderResult.insertedIds[0],
        supplier: "PT bukan ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[1],
        purchaseOrder_id: purchaseOrderResult.insertedIds[1],
        supplier: "PT ABC",
      },
      {
        purchaseReceive_id: purchaseReceiveResult.insertedIds[2],
        purchaseOrder_id: purchaseOrderResult.insertedIds[2],
        supplier: "PT ABC juga",
      },
    ];
    purchaseInvoiceFactory.sequence(data);
    await purchaseInvoiceFactory.createMany(3);

    const searchSupplier = "PT ABC";

    const response = await request(app)
      .get(`/v1/purchaseReportDetails?search[supplier]=${encodeURI(searchSupplier)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const purchaseInvoicesRecord = await retrieveAll("purchaseInvoices");
    const purchaseReceivesRecord = await retrieveAll("purchaseReceives");
    const purchaseOrdersRecord = await retrieveAll("purchaseOrders");
    expect(purchaseInvoicesRecord[1]._id).toStrictEqual(response.body.purchaseReportDetails[0]._id);
    expect(purchaseOrdersRecord[1].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.purchaseOrderNumber);
    expect(purchaseReceivesRecord[1].warehouse).toStrictEqual(response.body.purchaseReportDetails[0].purchaseReceive.warehouse);
    expect(purchaseOrdersRecord[1].vendorNumber).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorNumber);
    expect(purchaseOrdersRecord[1].vendorName).toStrictEqual(response.body.purchaseReportDetails[0].purchaseOrder.vendorName);
    expect(purchaseInvoicesRecord[1].createDate).toStrictEqual(response.body.purchaseReportDetails[0].createDate);
    expect(purchaseInvoicesRecord[1].noInvoice).toStrictEqual(response.body.purchaseReportDetails[0].noInvoice);
    expect(purchaseInvoicesRecord[1].item).toStrictEqual(response.body.purchaseReportDetails[0].item);
    expect(purchaseInvoicesRecord[1].itemDescription).toStrictEqual(response.body.purchaseReportDetails[0].itemDescription);
    expect(purchaseInvoicesRecord[1].qtyVoucher).toStrictEqual(response.body.purchaseReportDetails[0].qtyVoucher);
    expect(purchaseInvoicesRecord[1].materialPrice).toStrictEqual(response.body.purchaseReportDetails[0].materialPrice);
    expect(purchaseInvoicesRecord[1].materialPriceConversion).toStrictEqual(response.body.purchaseReportDetails[0].materialPriceConversion);
    expect(purchaseInvoicesRecord[1].discount).toStrictEqual(response.body.purchaseReportDetails[0].discount);
    expect(purchaseInvoicesRecord[1].afterDiscount).toStrictEqual(response.body.purchaseReportDetails[0].afterDiscount);
    expect(purchaseInvoicesRecord[1].ppn).toStrictEqual(response.body.purchaseReportDetails[0].ppn);
    expect(purchaseInvoicesRecord[1].total).toStrictEqual(response.body.purchaseReportDetails[0].total);
    expect(purchaseInvoicesRecord[2]._id).toStrictEqual(response.body.purchaseReportDetails[1]._id);
    expect(purchaseOrdersRecord[2].purchaseOrderNumber).toStrictEqual(response.body.purchaseReportDetails[1].purchaseOrder.purchaseOrderNumber);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);    
    // validate filter
    response.body.purchaseReportDetails.forEach((element:any) => {
      expect(element.supplier).toContain(searchSupplier);
    });
    // check database
  });
});
