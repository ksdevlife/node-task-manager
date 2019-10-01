const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

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
        res.status(201).send({user, token})
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.get('/', auth, async (req, res) => {
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


router.get('/me', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (err) { 
        res.status(500).send()
    } 
})

router.patch('/me', auth, async (req, res) => {
    const keys = Object.keys(req.body)
    const allowKeys = ['name', 'email', 'password']
    const isValidKeys = keys.every(key => allowKeys.includes(key))
    if (!isValidKeys) {
        res.status(400).res({error: 'Invalid key is detected'})
    }
    try {
        const user = req.user
        keys.forEach(key => user[key] = req.body[key])
        await user.save()
        res.send(user)
    } catch (err) { 
        res.status(400).send(err)
    } 
})

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
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

router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            res.status(404).send() 
        }
        res.send(user)
    } catch (err) { 
        res.status(500).send()
    } 
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please input jpg or png file'), false)
        }
        return cb(undefined, true)
    }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize(250, 250).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/:id/avatar', async (req, res) => { 
    try {
        const user = User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send()
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router