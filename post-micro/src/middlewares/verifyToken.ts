import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import axios from "axios";

export interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
  };
}

interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.AUTH_MICRO_JWT_SECRET as string) as {
      id: number;
      email: string;
    };
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });
    
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const result = (await axios.get(
      `${process.env.AUTH_MICRO_SERVICE_URL}/api/auth/me`,
      {
        headers,
      }
    )) as { data: AuthResponse };

    if (!result) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { user } = result.data;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
