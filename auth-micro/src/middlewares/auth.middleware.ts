import { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

export interface RequestWithUser extends Request {
  user?: {
    id: number;
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
    };
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
