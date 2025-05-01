const { Post } = require('../models')

class Authorization {
    static async mechanicOnlyPostAccess(req, res, next) {
        try {
            // Check if user is a mechanic
            if (req.user.role !== 'mechanic') {
                throw { name: 'Forbidden', message: 'Only mechanics can perform this action' }
            }

            next()
        } catch (error) {
            next(error)
        }
    }

    static async mechanicPostOwnership(req, res, next) {
        try {
            const postId = req.params.id
            const post = await Post.findByPk(postId)

            if (!post) {
                throw { name: 'NotFound', message: 'Post not found' }
            }

            if (post.MechanicId !== req.user.id) {
                throw { name: 'Forbidden', message: 'You can only modify your own posts' }
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = Authorization