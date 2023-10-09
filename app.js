const express = require("express");
const sqlite = require("sqlite");
const { open } = sqlite;
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const app = express();
module.exports = app;
app.use(express.json());
let db = null;
const cricket = async function () {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
    process.exit(1);
  }
};
cricket();
const statusTodo = (value) => {};
const duedate = (value) => {
  return {
    id: value.id,
    todo: value.todo,
    priority: value.priority,
    status: value.status,
    category: value.category,
    dueDate: value.due_date,
  };
};
// status todo
app.get("/todos/", async (request, response) => {
  const {
    status,
    id,
    todo,
    priority,
    category,
    due_date,
    search_q,
  } = request.query;
  if (priority && status) {
    const query = `SELECT * FROM todo WHERE (priority='${priority}' AND status='${status}');`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (search_q) {
    const query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (category && status) {
    const query = `SELECT * FROM todo WHERE (category='${category}' AND status='${status}');`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (priority && category) {
    const query = `SELECT * FROM todo WHERE (category='${category}' AND priority='${priority}');`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE"
  ) {
    const query = `SELECT * FROM todo WHERE status='${status}';`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (status) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority === "HIGH" ||
    priority === "LOW" ||
    priority === "MEDIUM"
  ) {
    const query = `SELECT * FROM todo WHERE priority='${priority}';`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (priority) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  ) {
    const query = `SELECT * FROM todo WHERE category='${category}';`;
    const result = await db.all(query);
    list = [];
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } else if (category) {
    response.status(400);
    response.send("Invalid Todo Category");
  }
});
// get id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id='${todoId}';`;
  const result = await db.get(query);
  const final = duedate(result);
  response.send(final);
});
// agenda
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  try {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const query = `SELECT * FROM todo WHERE due_date='${newDate}';`;
    list = [];
    const result = await db.all(query);
    for (let i of result) {
      const final = duedate(i);
      list.push(final);
    }
    response.send(list);
  } catch {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//post
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (!(status === "TO DO" || status === "IN PROGRESS" || status === "DONE")) {
    response.status(400);
    response.send("Invalid Todo Status");
  }

  if (!(priority === "HIGH" || priority === "LOW" || priority === "MEDIUM")) {
    response.status(400);
    response.send("Invalid Todo Priority");
  }

  if (
    !(category === "WORK" || category === "HOME" || category === "LEARNING")
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  }

  try {
    const newDate = format(new Date(dueDate), "yyyy-MM-dd");
  } catch {
    response.status(400);
    response.send("Invalid Due Date");
  }

  const query = `INSERT INTO todo(id, todo, priority, status, category, due_date)
    VALUES('${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  const result = await db.run(query);
  response.send("Todo Successfully Added");
});

// update
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status, category, dueDate } = request.body;
  console.log(status);

  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    const query = `UPDATE todo
            SET status='${status}'
            WHERE id='${todoId}'`;
    await db.run(query);
    response.send("Status Updated");
  } else if (status !== undefined) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority === "HIGH" ||
    priority === "LOW" ||
    priority === "MEDIUM"
  ) {
    const query = `UPDATE todo
              SET priority='${priority}'
              WHERE id='${todoId}'`;
    await db.run(query);
    response.send("Priority Updated");
  } else if (priority !== undefined) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (todo) {
    const query = `UPDATE todo
              SET todo='${todo}'
              WHERE id='${todoId}'`;
    await db.run(query);
    response.send("Todo Updated");
  } else if (
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  ) {
    const query = `UPDATE todo
              SET category='${category}'
              WHERE id='${todoId}'`;
    await db.run(query);
    response.send("Category Updated");
  } else if (category !== undefined) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (dueDate) {
    try {
      const newDate = format(new Date(dueDate), "yyyy-MM-dd");
      const query = `UPDATE todo
                    SET due_date='${newDate}'
                    WHERE id='${todoId}'`;
      await db.run(query);
      response.send("Due Date Updated");
    } catch {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});
// delete
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const players = `DELETE FROM todo
      WHERE id='${todoId}';`;
  await db.run(players);
  response.send("Todo Deleted");
});
