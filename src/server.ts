import dotenv from "dotenv";
import app from "./app.js";

// 環境変数の読み込み
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT);

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close();
});

process.on("SIGINT", () => {
  server.close();
});
