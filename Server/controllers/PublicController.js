const { Package, Post, Mechanic, sequelize, Op } = require('../models')

module.exports = class PublicController {
    static async getAllMechanics(req, res, next) {
        try {
            const { search } = req.query
            
            let whereClause = {
                role: 'mechanic'
            }

            if (search) {
                whereClause = {
                    ...whereClause,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${search}%` } },
                        { speciality: { [Op.iLike]: `%${search}%` } }
                    ]
                }
            }

            const mechanics = await Mechanic.findAll({
                where: whereClause,
                attributes: {
                    exclude: ['password']
                },
                order: [['id', 'ASC']]
            })

            const packages = await Package.findAll()
            res.status(200).json(mechanics, packages)
        } catch (error) {
            next(error)
        }
    }

    static async getAllPosts(req, res, next) {
        try {
            const posts = await Post.findAll({
                order: [['id', 'DESC']],
                include: {
                    model: Mechanic,
                    attributes: ['id', 'fullName', 'speciality', 'experience'],
                },
                attributes: {
                    exclude: ['MechanicId', 'createdAt', 'updatedAt']
                }
            })

            res.status(200).json(posts)
        } catch (error) {
            next(error)
        }
    }

    static async getMechanicById(req, res, next) {
        try {
            const { id } = req.params

            const mechanic = await Mechanic.findByPk(id, {
                attributes: {
                    exclude: ['password']
                }
            })

            if (!mechanic) {
                return res.status(404).json({ message: 'Mechanic not found' })
            }

            res.status(200).json(mechanic)
        } catch (error) {
            next(error)
        }
    }

    static async getPackage(req, res, next) {

        try {
            const packages = await Package.findAll({
                order: [['id', 'ASC']]
            })

            res.status(200).json(packages)
        } catch (error) {
            next(error)
        }
    }
    static async getPostById(req, res, next) {
        try {
            const { id } = req.params

            const post = await Post.findByPk(id, {
                include: {
                    model: Mechanic,
                    attributes: ['id', 'fullName', 'speciality', 'experience'],
                },
                attributes: {
                    exclude: ['MechanicId', 'createdAt', 'updatedAt']
                }
            })

            if (!post) {
                return res.status(404).json({ message: 'Post not found' })
            }

            res.status(200).json(post)
        } catch (error) {
            next(error)
        }
    }
}