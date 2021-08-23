process.env.NODE_ENV = 'test'
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testCompany
beforeEach(async () => {
    const result = await db.query("INSERT INTO companies (name, description, code) VALUES ('Google', 'A search engine company', 'goog') RETURNING code, name, description")
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query("DELETE FROM companies")
})

describe("Company routes", () => {
    test("Get all companies route", async () => {
        const response = await request(app).get('/companies')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
            "companies": [testCompany]
        })
    })

    test("Get single company route", async () => {
        const response = await request(app).get('/companies/goog')
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("company")
        expect(response.body.company).toHaveProperty("code")
        expect(response.body.company.code).toBe("goog")
        })
    })

    test("Get single company route, failure", async () => {
        const response = await request(app).get('/companies/goop')
        expect(response.statusCode).toBe(404)
        expect(response.body).toHaveProperty("error")
    })

    test("Post to companies route", async () => {
        const response = await request(app).post('/companies').send({name: "Apple", description: "Makes iPhones", code: "aapl"})
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("company");
        expect(response.body.company).toHaveProperty("description");
        expect(response.body.company.code).toEqual("aapl");
    })

    test("Post to companies route, failure", async () => {
        const response = await request(app).post('/companies').send({snoop: "dogg", code: "aapl"})
        expect(response.statusCode).toBe(500)
        expect(response.body).toHaveProperty("error")
    })

    test("Put to company route", async () => {
        const response = await request(app).put('/companies/goog').send({name: "Gooble", description: "Makes iPhones", code: "goog"})
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("company");
        expect(response.body.company).toHaveProperty("description");
        expect(response.body.company.name).toEqual("Gooble");
    })

    test("Put to company route, failure", async () => {
        const response = await request(app).put('/companies/goot').send({name: "Gooble", description: "Makes iPhones", code: "goog"})
        expect(response.statusCode).toBe(404)
        expect(response.body).toHaveProperty("error")
    })

    test("Delete company route", async () => {
        const response = await request(app).delete('/companies/goog')
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("status");
        expect(response.body.status).toBe("deleted");

    })


afterAll(async () => {
    await db.end()
})