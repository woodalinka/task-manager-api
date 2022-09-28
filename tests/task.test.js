const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull
    expect(task.completed).toBe(false)
})

test('Should return only the task created by one user', async() => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should fetch user task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async() => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not allow unauthorized user delete tasks', async() => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not update other user task', async () => {
    await request(app)
        .patch(`/task/${taskOne.id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should not create task with invalid description/completed', async() => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: '',
        })
        .expect(400)
})

test('Should not update task with invalid description/completed', async() => {
    const response = await request(app)
        .patch(`/tasks/:${taskOne.id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: '',
        })
        .expect(400)
})

test('Should fetch only completed tasks', async()=> {
        const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}` )
        .send()
            .expect(200)
        expect(response.body.length).toBe(1)
})

test('Should fetch only incomplete tasks', async()=> {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}` )
        .send()
        .expect(200)
    expect(response.body.length).toBe(0)
})

test('Should sort tasks by description/completed/createdAt/updatedAt', async() => {
    const response = await request(app)
        .get('/tasks?sortBy=completed:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body).toMatchObject([{
        description: 'First task',
        completed: false
    },{
        description: 'Second task',
        completed: true
    }])
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks?limit=1&skip=1')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body).toMatchObject([
        {
            description: 'Second task',
            completed: true
        }])
})

