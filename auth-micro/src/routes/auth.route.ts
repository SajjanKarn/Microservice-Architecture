import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// @ts-ignore
router.post("/login", AuthController.login);
// @ts-ignore
router.post("/register", AuthController.register);
// @ts-ignore
router.get("/me", authMiddleware, AuthController.me); // protected route

export default router;
