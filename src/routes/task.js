const express = require('express')

const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/', auth, async (req, res) => {
    // console.log(req.body)
    try {
        console.log(req.user)
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        console.log(task);
        
        await task.save()
        res.status(201).send(task)
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.get('/', auth, async (req, res) => {
    try {
        // const task = await Task.find({owner: req.user._id})
        // res.send(task)
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (err) { 
        res.status(500).send()
    } 
})

router.get('/tab', auth, async (req, res) => {
    const match = {}
    const limit = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.limit) { 
        limit = parseInt(req.query.limit)
    }
    if (req.query.sort_by) { 
        const parts = req.query.sort_by.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    console.log(sort)
    try {
        await req.user.populate({
            path: 'tasks',
            // match: {completed: false}
            match,
            options: {
                limit,
                skip: parseInt(req.query.skip) * limit,
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (err) { 
        res.status(500).send()
    } 
})

router.patch('/:id', auth, async (req, res) => {
    const keys = Object.keys(req.body)
    const allowKeys = ['description', 'completed']
    const isValidKeys = keys.every(key => allowKeys.includes(key))
    if (!isValidKeys) {
        res.status(400).res({error: 'Invalid key is detected'})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            res.status(404).send() 
        }
        keys.forEach(key => task[key] = req.body[key])
        await task.save()
        res.send(task)
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.delete('/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        
        if (!task) {
            res.status(404).send() 
        }
        res.send(task)
    } catch (err) { 
        res.status(500).send(err)
    } 
})

module.exports = router