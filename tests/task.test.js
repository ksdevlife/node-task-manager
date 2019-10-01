const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')

const {
    userOneId, userOne, 
    setupDatabase, 
    taskOne, userTwo} = require('./fixtures/db')
beforeEach(setupDatabase)

test('should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            description: 'From my test'
        })
        .expect(201)

        const task = await Task.findById(response.body._id)
        expect(task).not.toBeNull()
        expect(task.completed).toEqual(false.toString())
});

test('should fetch user tasks for user one', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200)

        expect(response.body).toHaveLength(2)
    
});

// test('should not delete first task by second user', async () => {
test('should not delete other users tasks', async () => {
    const response = await request(app)
        .delete('/tasks' + taskOne._id.toString())
        .set('Authorization', 'Bearer ' + userTwo.tokens[0].token)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()

});