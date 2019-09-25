const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validato(data) {
            if (!validator.isEmail(data)) {
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validato(data) {
            if (data.toLowerCase().includes('password')) { 
                throw new Error('Password cannot include "password"')
            }
        } 
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateToken = async function () {
    const user = this
    const token = await jwt.sign({_id: user._id}, 'mysecret', {expiresIn: '7days'})
    return token
}

userSchema.statics.findByCredentials = async ({email, password}) => {
    // console.log(email)
    // console.log(password)
    const user = await User.findOne({email})
    if (!user) {
        throw new Error('USER NOT FOUND')
    }
    const isPassMatch = await bcrypt.compare(password, user.password)
    // console.log(isPassMatch)
    if (isPassMatch) {
        return user
    } else {
        throw new Error('Password is not match')
    }
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

User = mongoose.model('User', userSchema)

module.exports = User