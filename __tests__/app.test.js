const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

const idealOutputGetUsers = [
  {
    username: "butter_bridge",
    name: "jonny",
    avatar_url:
      "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
  },
  {
    username: "icellusedkars",
    name: "sam",
    avatar_url: "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
  },
  {
    username: "rogersop",
    name: "paul",
    avatar_url: "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
  },
  {
    username: "lurker",
    name: "do_nothing",
    avatar_url:
      "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
  },
];

const idealOutputPatchTopicsByID = {
  article_id: 1,
  title: "Living in the shadow of a great man",
  topic: "mitch",
  author: "butter_bridge",
  body: "I find this existence challenging",
  created_at: "2020-07-09T20:11:00.000Z",
  votes: 105,
};

const idealOutputGetTopicByID = {
  article_id: 1,
  title: "Living in the shadow of a great man",
  topic: "mitch",
  author: "butter_bridge",
  body: "I find this existence challenging",
  comment_count: 11,
  created_at: "2020-07-09T20:11:00.000Z",
  votes: 100,
};

const idealOutputGetTopics = [
  { slug: "mitch", description: "The man, the Mitch, the legend" },
  { slug: "cats", description: "Not dogs" },
  { slug: "paper", description: "what books are made of" },
];

describe("Error handling for invalid endpoint", () => {
  test("status:404, responds with an error message when passed an non-existant endpoint", () => {
    return request(app)
      .get("/api/iDontExist")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid endpoint.");
      });
  });
});

describe("GET /api/topics", () => {
  test("should respond with an array", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const data = response.body;
        expect(Array.isArray(data.topics)).toBe(true);
      });
  });
  test("should respond with an array of length 3", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const data = response.body;
        expect(data.topics.length).toBe(3);
      });
  });
  test("should respond with an array of objects, with a key of slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const data = response.body;
        expect(data.topics).toEqual(idealOutputGetTopics);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Should be able to return an object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const articles = response.body;
        expect(typeof articles).toBe("object");
      });
  });
  test("Should be able to return an object with appropriate keys, including comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        let article = body.article;
        expect(article).toEqual(idealOutputGetTopicByID);
      });
  });
  test("Should return a 404 and 'article_id does not exist' when given an invalid article_ID", () => {
    return request(app)
      .get("/api/articles/9001")
      .expect(404)
      .then(({ _body }) => {
        expect(_body.msg).toBe("article_id does not exist");
      });
  });
  test('should return an error 400 and msg "Bad request"', () => {
    return request(app)
      .get("/api/articles/imNotAnID")
      .expect(400)
      .then((response) => {
        expect(response._body.msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should respond with an object", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        const article = response.body;
        expect(typeof article).toBe("object");
      });
  });
  test("should respond with an article with updated votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 5 })
      .expect(200)
      .then((response) => {
        const article = response.body;
        expect(article).toEqual(idealOutputPatchTopicsByID);
      });
  });
  test("should respond with status 400 Bad Request when given a missing input field", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response._body.msg).toBe("Bad request");
      });
  });
  test("should respond with status 400 Bad Request when given an incorrect input type", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "word" })
      .expect(400)
      .then((response) => {
        expect(response._body.msg).toBe("Bad request");
      });
  });
  test("should respond with a 404 when a non-existent ID is passed", () => {
    return request(app)
      .patch("/api/articles/9001")
      .send({ inc_votes: 2 })
      .expect(404)
      .then((response) => {
        expect(response._body.msg).toBe("Article not found");
      });
  });
});

describe("GET /api/users", () => {
  test("should respond with a an array", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const data = response.body;
        expect(Array.isArray(data)).toBe(true);
      });
  });
  test("should return an array of the users objects, with keys of username,name and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const data = response.body;
        expect(data).toEqual(idealOutputGetUsers);
      });
  });
  test("should respond with a satus 404 when passed an invalid route", () => {
    return request(app)
      .get("/api/users/notARoute")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid endpoint.");
      });
  });
});
