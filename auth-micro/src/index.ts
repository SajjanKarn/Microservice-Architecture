import express, { Application } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

// routes
import authRouter from "./routes/auth.route";

import { checkPrismaConnection } from "./lib/prisma";

dotenv.config();

const app: Application = express();

// middlewares
app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use(helmet());

// routes
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await checkPrismaConnection();
    console.log("Connected to the database successfully.");
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
});
