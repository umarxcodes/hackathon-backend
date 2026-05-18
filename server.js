import { fileURLToPath } from "url";
import app from "./app.js";

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
let server;

const startServer = (port, attempt = 0) => {
  const maxAttempts = 5;
  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < maxAttempts) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} in use, trying port ${nextPort} (attempt ${attempt + 1})`
      );
      setTimeout(() => startServer(nextPort, attempt + 1), 300);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  startServer(DEFAULT_PORT);
}

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  if (server && server.close) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
