const express = require('express')
require('./db/mongoose')
const app = express()

app.use(express.json())

const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

module.exports = app