const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const {userOneId, userOne, unRegisterdUser, setupDatabase} = require('./fixtures/db')
beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: 'MyPass777!'
    }).expect(201)
    // console.log(response.body)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // expect(response.body).toMatchObject({
    // const extMatch = { 
    //     user: {
    //         name: 'Andrew',
    //         email: 'andrew@example.com'
    //     },
    //     token: user.tokens[0].token
    // }
    // console.log(extMatch)

    // expect(extMatch).toMatchObject({
    expect(response.body).toMatchObject({
    // expect(response.body).objectContaining({
    // expect(response.body).toContain({
        user: {
            name: "Andrew",
            email: "andrew@example.com"
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    
    const user = await User.findById(userOneId)
    // console.log(user)
    expect(user.tokens.length).toBe(2)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login non-existent user', async () => {
    await request(app).post('/users/login').send({ 
        email: unRegisterdUser.email,
        password: unRegisterdUser.password,
    }).expect(400)
})

test('should get profile for user',async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete account for user', async () => {
    await request(app)
        .delete('/users/' + userOne._id.toHexString())
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200) 
})

test('should not delete account for unauthorized user', async () => {
    await request(app)
        .delete('/users/' + userOne._id.toHexString())
        .send()
        .expect(401) 
})

test('should delete own account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200) 

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete own account for unauthorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401) 
})

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer)) 
})

test('should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            name: 'Michael',
            email: 'jackson@example.com',
            password: 'Ready123!'
        })
        .expect(200)
        
        expect(response.body).toMatchObject({ 
            name: 'Michael',
            email: 'jackson@example.com',
        })

        const user = await User.findById(userOne)
        expect(user.name).toEqual('Michael')
        expect(user.email).toEqual('jackson@example.com')

});

test('should not update invalid user fields', async () => {
    const response = request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            location: "New York"
        })
        .expect(400) 
});