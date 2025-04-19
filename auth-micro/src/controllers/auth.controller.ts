import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

import {
  ErrorResponse,
  ILoginRequest,
  IRegisterRequest,
  LoginResponse,
  RegisterResponse,
} from "./_types/auth.types";
import { RequestWithUser } from "../middlewares/auth.middleware";

class AuthController {
  static async login(
    req: Request,
    res: Response<LoginResponse | ErrorResponse>
  ): Promise<Response<LoginResponse | ErrorResponse>> {
    try {
      if (req.body === undefined) {
        return res.status(400).json({ error: "Request body is required" });
      }
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // validate email and password
      if (
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) === false
      ) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      // check if user exists
      const doesUserExist = await prisma.user.findUnique({
        where: { email },
      });
      if (!doesUserExist)
        return res.status(401).json({ error: "Invalid email or password" });

      // check if password is correct
      const isPasswordValid = await bcrypt.compare(
        password,
        doesUserExist.password
      );
      if (!isPasswordValid)
        return res.status(401).json({ error: "Invalid email or password" });

      // generate JWT token
      const token = jwt.sign(
        { id: doesUserExist.id, email: doesUserExist.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      console.error("Error in login:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async register(
    req: Request,
    res: Response<RegisterResponse | ErrorResponse>
  ): Promise<Response<RegisterResponse | ErrorResponse>> {
    try {
      if (req.body === undefined) {
        return res.status(400).json({ error: "Request body is required" }); // error here isn't typed
      }
      const { name, email, password } = req.body as IRegisterRequest;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email and password are required" });
      }

      // validate email and password
      if (name.length < 3)
        return res.status(400).json({ error: "Name is too short" });
      if (
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) === false
      ) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      // check if user exists
      const doesUserExist = await prisma.user.findUnique({
        where: { email },
      });
      if (doesUserExist)
        return res.status(409).json({ error: "User already exists" });

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("Error in register:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async me(
    req: RequestWithUser,
    res: Response
  ): Promise<Response<{ user: { id: number; name: string; email: string } }>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error in me:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default AuthController;
