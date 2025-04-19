import { Router } from "express";
import { authMiddleware } from "../middlewares/verifyToken";
import PostController from "../controllers/post.controller";

const router = Router();

// @ts-ignore
router.post("/posts", authMiddleware, PostController.createPost);
// @ts-ignore
router.get("/posts/me", authMiddleware, PostController.getMyPosts);

// now we can go on for the rest of the CRUD operations

export default router;
