/* eslint-disable prettier/prettier */
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import request from "supertest";
import UserFactory from "../../user/model/user.factory.js";
import CustomerFactory from "../model/customer.factory.js";
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

describe("retrieve all Debts Aging Reports Per Customer", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 retrieve all Debts Aging Reports Per Customer failed because user is not login yet", async () => {
    const app = await createApp();

    const response = await request(app).get("/v1/debtsAgingReportPerCustomers/");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 retrieve all Debts Aging Reports Per Customer failed, dont have permission", async () => {
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
      .get("/v1/debtsAgingReportPerCustomers/")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 retrieve all Debts Aging Reports Per Customer success", async () => {
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

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        customerID: customerResult.insertedIds[0],
      },
      {
        customerID: customerResult.insertedIds[1],
      },
      {
        customerID: customerResult.insertedIds[2],
      },
    ]
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const response = await request(app)
      .get("/v1/debtsAgingReportPerCustomers/")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const customerRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[0]._id);
    expect(customerRecord[0].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].customerID);
    expect(customerRecord[0].name).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].name);
    expect(salesInvoiceRecord[0].invoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[0].invoiceDate).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].description);
    expect(salesInvoiceRecord[0].dpp).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[0].ppn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[0].totalInvoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].totalInvoice);
    expect(salesInvoiceRecord[0].payment).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].payment);
    expect(salesInvoiceRecord[0].debitMemo).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].debitMemo);
    expect(salesInvoiceRecord[0].cn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].cn);
    expect((salesInvoiceRecord[0].payment-salesInvoiceRecord[0].debitMemo)).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].remaining);
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[1]._id);
    expect(customerRecord[1].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[1].customerID);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[2]._id);
    expect(customerRecord[2].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[2].customerID);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(3);
    // check database
  });
  it("1.4 retrieve all Debts Aging Reports Per Customer success, with filter date", async () => {
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

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        customerID: customerResult.insertedIds[0],
        invoiceDate: "2022-01-01",
      },
      {
        customerID: customerResult.insertedIds[1],
        invoiceDate: "2021-01-01",
      },
      {
        customerID: customerResult.insertedIds[2],
        invoiceDate: "2022-01-01",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterDate = "2022-01-01";

    const response = await request(app)
      .get(`/v1/debtsAgingReportPerCustomers/?filter[dateFrom]=${encodeURI(filterDate)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const customerRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[0]._id);
    expect(customerRecord[0].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].customerID);
    expect(customerRecord[0].name).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].name);
    expect(salesInvoiceRecord[0].invoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[0].invoiceDate).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].description);
    expect(salesInvoiceRecord[0].dpp).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[0].ppn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[0].totalInvoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].totalInvoice);
    expect(salesInvoiceRecord[0].payment).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].payment);
    expect(salesInvoiceRecord[0].debitMemo).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].debitMemo);
    expect(salesInvoiceRecord[0].cn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].cn);
    expect((salesInvoiceRecord[0].payment-salesInvoiceRecord[0].debitMemo)).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].remaining);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[1]._id);
    expect(customerRecord[2].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[1].customerID);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.5 retrieve all Debts Aging Reports Per Customer success, with filter customer", async () => {
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

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        customerID: customerResult.insertedIds[0],
        customer: "customer A",
      },
      {
        customerID: customerResult.insertedIds[1],
        customer: "customer B",
      },
      {
        customerID: customerResult.insertedIds[2],
        customer: "customer B",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterCustomer = "customer B";

    const response = await request(app)
      .get(`/v1/debtsAgingReportPerCustomers/?filter[customer]=${encodeURI(filterCustomer)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const customerRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[0]._id);
    expect(customerRecord[1].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].customerID);
    expect(customerRecord[1].name).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].name);
    expect(salesInvoiceRecord[1].invoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[1].invoiceDate).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[1].description).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].description);
    expect(salesInvoiceRecord[1].dpp).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[1].ppn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[1].totalInvoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].totalInvoice);
    expect(salesInvoiceRecord[1].payment).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].payment);
    expect(salesInvoiceRecord[1].debitMemo).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].debitMemo);
    expect(salesInvoiceRecord[1].cn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].cn);
    expect((salesInvoiceRecord[1].payment-salesInvoiceRecord[1].debitMemo)).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].remaining);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[1]._id);
    expect(customerRecord[2].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[1].customerID);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.6 retrieve all Debts Aging Reports Per Customer success, with filter date and customer", async () => {
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

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        customerID: customerResult.insertedIds[0],
        invoiceDate: "2022-01-01",
        customer: "customer B",
      },
      {
        customerID: customerResult.insertedIds[1],
        invoiceDate: "2021-01-01",
        customer: "customer B",
      },
      {
        customerID: customerResult.insertedIds[2],
        invoiceDate: "2022-01-01",
        customer: "customer A",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterDate = "2022-01-01";
    const filterCustomer = "customer B";

    const response = await request(app)
      .get(
        `/v1/debtsAgingReportPerCustomers/?filter[dateFrom]=${encodeURI(filterDate)}&filter[item]=${encodeURI(filterCustomer)}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const customerRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[0]._id);
    expect(customerRecord[0].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].customerID);
    expect(customerRecord[0].name).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].name);
    expect(salesInvoiceRecord[0].invoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[0].invoiceDate).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[0].description).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].description);
    expect(salesInvoiceRecord[0].dpp).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[0].ppn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[0].totalInvoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].totalInvoice);
    expect(salesInvoiceRecord[0].payment).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].payment);
    expect(salesInvoiceRecord[0].debitMemo).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].debitMemo);
    expect(salesInvoiceRecord[0].cn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].cn);
    expect((salesInvoiceRecord[0].payment-salesInvoiceRecord[0].debitMemo)).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].remaining);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(1);
    // check database
  });
  it("1.7 retrieve all Debts Aging Reports Per Customer success, with search customer", async () => {
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

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        customerID: customerResult.insertedIds[0],
        customer: "customer bukan ABC",
      },
      {
        customerID: customerResult.insertedIds[1],
        customer: "customer ABC",
      },
      {
        customerID: customerResult.insertedIds[2],
        customer: "customer ABC juga",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const searchCustomer = "customer ABC";

    const response = await request(app)
      .get(`/v1/debtsAgingReportPerCustomers/?search[customer]=${encodeURI(searchCustomer)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const customerRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[0]._id);
    expect(customerRecord[1].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].customerID);
    expect(customerRecord[1].name).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].name);
    expect(salesInvoiceRecord[1].invoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[1].invoiceDate).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[1].description).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].description);
    expect(salesInvoiceRecord[1].dpp).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[1].ppn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[1].totalInvoice).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].totalInvoice);
    expect(salesInvoiceRecord[1].payment).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].payment);
    expect(salesInvoiceRecord[1].debitMemo).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].debitMemo);
    expect(salesInvoiceRecord[1].cn).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].cn);
    expect((salesInvoiceRecord[1].payment-salesInvoiceRecord[1].debitMemo)).toStrictEqual(response.body.debtsAgingReportPerCustomers[0].remaining);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.debtsAgingReportPerCustomers[1]._id);
    expect(customerRecord[2].customerID).toStrictEqual(response.body.debtsAgingReportPerCustomers[1].customerID);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
});
