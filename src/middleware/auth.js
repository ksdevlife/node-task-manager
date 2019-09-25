const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') 
        const decoded = jwt.verify(token, 'mysecret')
        // console.log(decoded)
        // const user = User.findById(decoded._id)
        const user = await User.findOne({
            _id: decoded._id, 
            'tokens.token': token
        })
        if (!user) {
            throw new Error()
        }

        req.user = user
        req.token = token
        next()
    } catch (err) {
        res.status(401).send({error: 'Please authenticate.'})
    }
}

module.exports = auth