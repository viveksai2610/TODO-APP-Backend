const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todo.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/todos/', async (request, response) => {
  const getTodosQuery = `
      SELECT * FROM todo;
      `
  const todos = await db.all(getTodosQuery)
  response.send(todos)
})

app.get('/todo/:id', async (request, response) => {
  const id = request.params.id

  const getTodoQuery = `
      SELECT * FROM todo
       WHERE
     id = ${id};
      `
  const todo = await db.all(getTodoQuery)

  if (todo.length === 1) {
    const getTodoQuery = `
      SELECT * FROM todo
       WHERE
     id = ${id};
      `
    const todo = await db.all(getTodoQuery)
    response.send(todo)
  } else {
    response.status(400)
    response.send('Invalid id')
  }
})

app.post('/todo/', async (request, response) => {
  const {id, title, status} = request.body
  const addTodoQuery = `
      INSERT INTO todo (id, title, status) VALUES
    (${id}, '${title}', '${status}');
      `
  await db.run(addTodoQuery)
  await response.send('Todo added successfully')
})

app.put('/todo/:id', async (request, response) => {
  const id = request.params.id

  const getTodoQuery = `
      SELECT * FROM todo
       WHERE
     id = ${id};
      `
  const todo = await db.all(getTodoQuery)
  if (todo.length === 1) {
    const {title, status} = request.body
    const updateTodoQuery = `
     UPDATE todo SET 
     title = '${title}',
     status = '${status}'
     WHERE
     id = ${id};
      `
    await db.run(updateTodoQuery)
    response.send('Todo updated successfully')
  } else {
    response.status(400)
    response.send('Invalid id')
  }
})

app.delete('/todo/:id', async (request, response) => {
  const id = request.params.id
  const getTodoQuery = `
      SELECT * FROM todo
       WHERE
     id = ${id};
      `
  const todo = await db.all(getTodoQuery)
  if (todo.length === 1) {
    const deleteTodoQuery = `
     DELETE FROM todo
     WHERE
     id = ${id};
    `
    await db.run(deleteTodoQuery)
    response.send('Todo deleted successfully')
  } else {
    response.status(400)
    response.send('Invalid id')
  }
})
