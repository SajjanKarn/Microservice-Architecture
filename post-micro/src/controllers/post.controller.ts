import { Response } from "express";
import { RequestWithUser } from "../middlewares/verifyToken";

import { prisma } from "../lib/prisma";
import axios from "axios";

interface IPost {
  title: string;
  content: string;
}

class PostController {
  static async createPost(req: RequestWithUser, res: Response) {
    if (!req.body) {
      return res.status(400).json({ error: "Please provide body" });
    }
    const { title, content } = req.body as IPost;
    const userId = req.user?.id;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    console.log(title, content);
    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId: userId?.toString()!,
        },
      });
      return res.status(201).json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMyPosts(req: RequestWithUser, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const posts = await prisma.post.findMany({
        where: {
          authorId: userId.toString(),
        },
      });
      const postsWithUser = posts.map((post) => {
        return {
          ...post,
          user: req.user,
        };
      });

      return res.status(200).json(postsWithUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default PostController;
