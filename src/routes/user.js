const express = require('express')

const User = require('../models/user')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body)
        // console.log(user)
        const token = await user.generateToken()
        user.tokens = user.tokens.concat({token})
        await user.save()
        res.send({user, token})
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.post('/logout', auth, async (req, res) => {
    try {
        const user = req.user
        // user.tokens = user.tokens.filter(token => token !== req.token)
        user.tokens = []
        await user.save()
        res.send(user)
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.post('/', async (req, res) => {
    // console.log(req.body)
    try {
        const user = new User(req.body)
        const token = await user.generateToken()
        user.tokens = user.tokens.concat({token})
        await user.save()
        res.status(201).send(user)
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.get('/me', auth, async (req, res) => {
    try {
        const user = req.user
        console.log(user)
        if (!user) {
            res.status(404).send() 
        }
        res.send(user)
    } catch (err) { 
        res.status(500).send()
    } 
})

router.get('/', async (req, res) => {
    try {
        const user = await User.find({})
        if (!user) {
            res.status(404).send() 
        }
        res.send(user)
    } catch (err) { 
        res.status(500).send()
    } 
})

router.patch('/:id', async (req, res) => {
    const keys = Object.keys(req.body)
    const allowKeys = ['name', 'email', 'password']
    const isValidKeys = keys.every(key => allowKeys.includes(key))
    if (!isValidKeys) {
        res.status(400).res({error: 'Invalid key is detected'})
    }
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(404).send() 
        }
        keys.forEach(key => user[key] = req.body[key])
        await user.save()
        res.send(user)
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            res.status(404).send() 
        }
        res.send(user)
    } catch (err) { 
        res.status(500).send(err)
    } 
})

module.exports = router