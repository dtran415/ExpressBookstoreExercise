process.env.NODE_ENV = "test"
const request = require("supertest");

const app = require("../app");
const db = require("../db");

const book = {
    "isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
}

beforeEach(async () => {
    await db.query("DELETE FROM BOOKS");
    await db.query(`INSERT INTO books 
        (isbn, amazon_url, author, language, pages, publisher, title, year)VALUES 
        ('${book.isbn}', 'http://a.co/eobPtX2', 'Matthew Lane', 'english', 264, 'Princeton University Press', 'Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017)`)
});

afterEach(() => {
    
});

afterAll(() => {
    db.end()
});


describe("GET /books", function() {
    it("should get a list of books", async function() {
        const response = await request(app).get("/books");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "books": [
                book
            ]
        });
    })
})

describe("GET /books/:id", function() {
    it("should get details of a book", async function() {
        const response = await request(app).get(`/books/${book.isbn}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "book": book
        });
    })

    it("should return 404 for nonexistent book", async function() {
        const response = await request(app).get(`/books/999`);
        expect(response.statusCode).toBe(404);
    })
})

describe("POST /books", function() {
    it("should create a new book", async function() {
        const book2 = {
            "isbn": "1234",
            "amazon_url": "http://www.amazon.com",
            "author": "Some Author",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "A new book",
            "year": 2023
        }
        const response = await request(app).post(`/books`).send(book2);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            "book": book2
        });
    })

    it("should return an error if adding book with isbn that exists", async function() {
        const response = await request(app).post(`/books`).send(book);
        expect(response.statusCode).toBe(500);
    })

    it("should return 400 with invalid data", async function() {
        const book2 = {
            "isbn": "1234",
            "amazon_url": "http://www.amazon.com"
        }
        const response = await request(app).post(`/books`).send(book2);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toEqual(expect.any(Array))
    })
})

describe("PUT /books/:isbn", function() {
    it("should update an existing book", async function() {
        const book2 = {...book}
        book2.pages = 300
        const response = await request(app).put(`/books/${book2.isbn}`).send(book2);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "book": book2
        });
    })

    it("should return 404 for nonexistent book", async function() {
        const book2 = {...book}
        book2.pages = 300
        const response = await request(app).put(`/books/999`).send(book2);
        expect(response.statusCode).toBe(404);
    })

    it("should return 400 for invalid data", async function() {
        const book2 = {...book}
        book2.pages = "300"
        const response = await request(app).put(`/books/${book2.isbn}`).send(book2);
        expect(response.statusCode).toBe(400);
    })
})

describe("DELETE /books/:isbn", function() {
    it("should delete a book", async function() {
        const response = await request(app).delete(`/books/${book.isbn}`)
        expect(response.statusCode).toBe(200);
    })

    it("should return 404 for a nonexistent book", async function() {
        const response = await request(app).delete(`/books/999`)
        expect(response.statusCode).toBe(404);
    })
})