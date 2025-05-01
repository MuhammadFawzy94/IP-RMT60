const { Post, Mechanic } = require('../models');

module.exports = class PostController{
    static async getAllPosts(req, res, next) {
        try {
            const posts = await Post.findAll();

            
            console.log('Posts data:', JSON.stringify(posts, null, 2));

            if (!posts.length) {
                return res.status(200).json({ message: "No posts found", data: [] });
            }

            res.status(200).json({
                message: "Posts fetched successfully",
                data: posts
            });
        } catch (error) {
            console.error('Error in getAllPosts:', error); 
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { title, content, imgUrl } = req.body;
            const MechanicId = req.user.id; 

            const newPost = await Post.create({ title, content, imgUrl, MechanicId });

            res.status(201).json({
                message: "Post created successfully",
                data: newPost
            });
        } catch (error) {
            console.error('Error in create post:', error); 
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { title, content, imgUrl } = req.body;
            const { id } = req.params;

            const post = await Post.findByPk(id);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            await post.update({ title, content, imgUrl });

            res.status(200).json({
                message: "Post updated successfully",
                data: post
            });
        } catch (error) {
            console.error('Error in update post:', error); 
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;

            const post = await Post.findByPk(id);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            await post.destroy();

            res.status(200).json({
                message: "Post deleted successfully",
                data: post
            });
        } catch (error) {
            console.error('Error in delete post:', error); 
            next(error);
        }
    }
}