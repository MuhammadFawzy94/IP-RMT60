const { verifyToken } = require('../helpers/jwt')
const { User, Mechanic } = require('../models')

const Authentication = async (req, res, next) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) {
        return next({ name: 'Unauthorized', message: 'Please login first' })
    }

    const accessToken = bearerToken.split(' ')[1]

    try {
        const data = verifyToken(accessToken)
        const mechanic = await Mechanic.findByPk(data.id)
        if(!mechanic) {
            return next({ name: 'Unauthorized', message: 'Invalid token' })
        }

        req.user = {
            id: mechanic.id,
            email: mechanic.email,
            role: mechanic.role
        }

        next()
    } catch (error) {
        return next({ name: 'Unauthorized', message: 'Invalid token' })
        
    }
}

const AuthenticationUser = async (req, res, next) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) {
        return next({ name: 'Unauthorized', message: 'Please login first' })
    }

    const accessToken = bearerToken.split(' ')[1]

    try {
        const data = verifyToken(accessToken)
        const user = await User.findByPk(data.id)
        if(!user) {
            return next({ name: 'Unauthorized', message: 'Invalid token' })
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        next()
    } catch (error) {
        return next({ name: 'Unauthorized', message: 'Invalid token' })
        
    }
}

module.exports = {Authentication, AuthenticationUser}