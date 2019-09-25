const express = require('express')
require('./db/mongoose')
const app = express()
const port = 3000

app.use(express.json())

const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))