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

describe("retrieve all Sales Report Per Customer", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("1.1 retrieve all Sales Report Per Customer failed because user is not login yet", async () => {
    const app = await createApp();

    const response = await request(app).get("/v1/salesReportPerCustomers");
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 retrieve all Sales Report Per Customer failed, dont have permission", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
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
      .get("/v1/salesReportPerCustomers")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 retrieve all Sales Report Per Customer success", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        username: "admin",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin1",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin2",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
    ];
    userFactory.sequence(userSeed);
    const userResult = await userFactory.createMany(3);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
      },
      {
        userID: userResult.insertedIds[1],        
        customerID: customerResult.insertedIds[1],
      },
      {
        userID: userResult.insertedIds[2],        
        customerID: customerResult.insertedIds[2],
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const response = await request(app)
      .get("/v1/salesReportPerCustomers")
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const usersRecord = await retrieveAll("users");
    const customersRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReportPerCustomers[0]._id);
    expect(salesInvoiceRecord[0].invoice).toStrictEqual(response.body.salesReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[0].invoiceDate).toStrictEqual(response.body.salesReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[0].noFakturPajak).toStrictEqual(response.body.salesReportPerCustomers[0].noFakturPajak);
    expect(salesInvoiceRecord[0].soldTo).toStrictEqual(response.body.salesReportPerCustomers[0].soldTo);
    expect(salesInvoiceRecord[0].salesman).toStrictEqual(response.body.salesReportPerCustomers[0].salesman);
    expect(salesInvoiceRecord[0].kdSalesman).toStrictEqual(response.body.salesReportPerCustomers[0].kdSalesman);
    expect(salesInvoiceRecord[0].name).toStrictEqual(response.body.salesReportPerCustomers[0].name);
    expect(salesInvoiceRecord[0].dpp).toStrictEqual(response.body.salesReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[0].ppn).toStrictEqual(response.body.salesReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[0].total).toStrictEqual(response.body.salesReportPerCustomers[0].total);
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReportPerCustomers[1]._id);
    expect(salesInvoiceRecord[1].invoice).toStrictEqual(response.body.salesReportPerCustomers[1].invoice);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReportPerCustomers[2]._id);
    expect(salesInvoiceRecord[2].invoice).toStrictEqual(response.body.salesReportPerCustomers[2].invoice);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(3);
    // check database
  });
  it("1.4 retrieve all Sales Report Per Customer success, with filter date", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        username: "admin",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin1",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin2",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
    ];
    userFactory.sequence(userSeed);
    const userResult = await userFactory.createMany(3);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
        invoiceDate: "2022-01-01",
      },
      {
        userID: userResult.insertedIds[1],        
        customerID: customerResult.insertedIds[1],
        invoiceDate: "2021-01-01",
      },
      {
        userID: userResult.insertedIds[2],        
        customerID: customerResult.insertedIds[2],
        invoiceDate: "2023-01-01",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";

    const response = await request(app)
      .get(`/v1/salesReportPerCustomers?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const usersRecord = await retrieveAll("users");
    const customersRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReportPerCustomers[0]._id);
    expect(salesInvoiceRecord[0].invoice).toStrictEqual(response.body.salesReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[0].invoiceDate).toStrictEqual(response.body.salesReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[0].noFakturPajak).toStrictEqual(response.body.salesReportPerCustomers[0].noFakturPajak);
    expect(salesInvoiceRecord[0].soldTo).toStrictEqual(response.body.salesReportPerCustomers[0].soldTo);
    expect(salesInvoiceRecord[0].salesman).toStrictEqual(response.body.salesReportPerCustomers[0].salesman);
    expect(salesInvoiceRecord[0].kdSalesman).toStrictEqual(response.body.salesReportPerCustomers[0].kdSalesman);
    expect(salesInvoiceRecord[0].name).toStrictEqual(response.body.salesReportPerCustomers[0].name);
    expect(salesInvoiceRecord[0].dpp).toStrictEqual(response.body.salesReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[0].ppn).toStrictEqual(response.body.salesReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[0].total).toStrictEqual(response.body.salesReportPerCustomers[0].total);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReportPerCustomers[1]._id);
    expect(salesInvoiceRecord[2].invoice).toStrictEqual(response.body.salesReportPerCustomers[1].invoice);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.5 retrieve all Sales Report Per Customer success, with filter customer", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        username: "admin",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin1",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin2",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
    ];
    userFactory.sequence(userSeed);
    const userResult = await userFactory.createMany(3);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
        salesman: "salesman A",
      },
      {
        userID: userResult.insertedIds[1],        
        customerID: customerResult.insertedIds[1],
        salesman: "salesman B",
      },
      {
        userID: userResult.insertedIds[2],        
        customerID: customerResult.insertedIds[2],
        salesman: "salesman B",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterSalesman = "salesman B";

    const response = await request(app)
      .get(`/v1/salesReportPerCustomers?filter[item]=${encodeURI(filterSalesman)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const usersRecord = await retrieveAll("users");
    const customersRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReportPerCustomers[0]._id);
    expect(salesInvoiceRecord[1].invoice).toStrictEqual(response.body.salesReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[1].invoiceDate).toStrictEqual(response.body.salesReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[1].noFakturPajak).toStrictEqual(response.body.salesReportPerCustomers[0].noFakturPajak);
    expect(salesInvoiceRecord[1].soldTo).toStrictEqual(response.body.salesReportPerCustomers[0].soldTo);
    expect(salesInvoiceRecord[1].salesman).toStrictEqual(response.body.salesReportPerCustomers[0].salesman);
    expect(salesInvoiceRecord[1].kdSalesman).toStrictEqual(response.body.salesReportPerCustomers[0].kdSalesman);
    expect(salesInvoiceRecord[1].name).toStrictEqual(response.body.salesReportPerCustomers[0].name);
    expect(salesInvoiceRecord[1].dpp).toStrictEqual(response.body.salesReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[1].ppn).toStrictEqual(response.body.salesReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[1].total).toStrictEqual(response.body.salesReportPerCustomers[0].total);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReportPerCustomers[1]._id);
    expect(salesInvoiceRecord[2].invoice).toStrictEqual(response.body.salesReportPerCustomers[1].invoice);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
  it("1.6 retrieve all Sales Report Per Customer success, with filter date and customer", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        username: "admin",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin1",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin2",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
    ];
    userFactory.sequence(userSeed);
    const userResult = await userFactory.createMany(3);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
        invoiceDate: "2022-01-01",
        salesman: "salesman B",
      },
      {
        userID: userResult.insertedIds[1],        
        customerID: customerResult.insertedIds[1],
        invoiceDate: "2021-01-01",
        salesman: "salesman B",
      },
      {
        userID: userResult.insertedIds[2],        
        customerID: customerResult.insertedIds[2],
        invoiceDate: "2023-01-01",
        salesman: "salesman A",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const filterDateFrom = "2022-01-01";
    const filterDateTo = "2023-01-01";
    const filterSalesman = "salesman B";

    const response = await request(app)
      .get(
        `/v1/salesReportPerCustomers?filter[dateFrom]=${encodeURI(filterDateFrom)}&filter[dateTo]=${encodeURI(filterDateTo)}&filter[item]=${encodeURI(filterSalesman)}`
      )
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const usersRecord = await retrieveAll("users");
    const customersRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[0]._id).toStrictEqual(response.body.salesReportPerCustomers[0]._id);
    expect(salesInvoiceRecord[0].invoice).toStrictEqual(response.body.salesReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[0].invoiceDate).toStrictEqual(response.body.salesReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[0].noFakturPajak).toStrictEqual(response.body.salesReportPerCustomers[0].noFakturPajak);
    expect(salesInvoiceRecord[0].soldTo).toStrictEqual(response.body.salesReportPerCustomers[0].soldTo);
    expect(salesInvoiceRecord[0].salesman).toStrictEqual(response.body.salesReportPerCustomers[0].salesman);
    expect(salesInvoiceRecord[0].kdSalesman).toStrictEqual(response.body.salesReportPerCustomers[0].kdSalesman);
    expect(salesInvoiceRecord[0].name).toStrictEqual(response.body.salesReportPerCustomers[0].name);
    expect(salesInvoiceRecord[0].dpp).toStrictEqual(response.body.salesReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[0].ppn).toStrictEqual(response.body.salesReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[0].total).toStrictEqual(response.body.salesReportPerCustomers[0].total);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(1);
    // check database
  });
  it("1.7 retrieve all Sales Report Per Customer success, with search customer", async () => {
    const app = await createApp();

    const userFactory = new UserFactory();
    const userSeed = [
      {
        username: "admin",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin1",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
      {
        username: "admin2",
        password: await hash("admin123"),
        email: faker.internet.email(),
        role: "admin",
      },
    ];
    userFactory.sequence(userSeed);
    const userResult = await userFactory.createMany(3);

    const responseLogin = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });

    const customerFactory = new CustomerFactory();
    const customerResult = await customerFactory.createMany(3);

    const salesInvoiceFactory = new SalesInvoiceFactory();
    const data = [
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
        salesman: "salesman bukan ABC",
      },
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
        salesman: "salesman ABC",
      },
      {
        userID: userResult.insertedIds[0],        
        customerID: customerResult.insertedIds[0],
        salesman: "salesman ABC juga",
      },
    ];
    salesInvoiceFactory.sequence(data);
    await salesInvoiceFactory.createMany(3);

    const searchSalesman = "salesman ABC";

    const response = await request(app)
      .get(`/v1/salesReportPerCustomers?search[item]=${encodeURI(searchSalesman)}`)
      .set("Authorization", `Bearer ${responseLogin.body.accessToken}`);
    // check status code
    expect(response.statusCode).toEqual(200);
    // check response body
    const salesInvoiceRecord = await retrieveAll("salesInvoices");
    const usersRecord = await retrieveAll("users");
    const customersRecord = await retrieveAll("customers");
    expect(salesInvoiceRecord[1]._id).toStrictEqual(response.body.salesReportPerCustomers[0]._id);
    expect(salesInvoiceRecord[1].invoice).toStrictEqual(response.body.salesReportPerCustomers[0].invoice);
    expect(salesInvoiceRecord[1].invoiceDate).toStrictEqual(response.body.salesReportPerCustomers[0].invoiceDate);
    expect(salesInvoiceRecord[1].noFakturPajak).toStrictEqual(response.body.salesReportPerCustomers[0].noFakturPajak);
    expect(salesInvoiceRecord[1].soldTo).toStrictEqual(response.body.salesReportPerCustomers[0].soldTo);
    expect(salesInvoiceRecord[1].salesman).toStrictEqual(response.body.salesReportPerCustomers[0].salesman);
    expect(salesInvoiceRecord[1].kdSalesman).toStrictEqual(response.body.salesReportPerCustomers[0].kdSalesman);
    expect(salesInvoiceRecord[1].name).toStrictEqual(response.body.salesReportPerCustomers[0].name);
    expect(salesInvoiceRecord[1].dpp).toStrictEqual(response.body.salesReportPerCustomers[0].dpp);
    expect(salesInvoiceRecord[1].ppn).toStrictEqual(response.body.salesReportPerCustomers[0].ppn);
    expect(salesInvoiceRecord[1].total).toStrictEqual(response.body.salesReportPerCustomers[0].total);
    expect(salesInvoiceRecord[2]._id).toStrictEqual(response.body.salesReportPerCustomers[1]._id);
    expect(salesInvoiceRecord[2].invoice).toStrictEqual(response.body.salesReportPerCustomers[1].invoice);

    expect(response.body.pagination.page).toStrictEqual(1);
    expect(response.body.pagination.pageSize).toStrictEqual(10);
    expect(response.body.pagination.pageCount).toStrictEqual(1);
    expect(response.body.pagination.totalDocument).toStrictEqual(2);
    // check database
  });
});
