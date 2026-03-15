import cors from "cors";
import express, { Application } from "express";
import { corsOptions } from "./config/cors.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app: Application = express();

// ミドルウェア設定
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルーティング設定
app.use("/api", routes);

// エラーハンドリング
app.use(errorHandler);

export default app;
