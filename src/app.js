import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import appRouter from "./router.js";
import { API_RESPONSE } from "./utils/ApiResponse.js";
import { sanitizeInput } from "./middleware/sanitizer.middleware.js";

const app = express();

// security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({ origin: "*" }));

// Serve static files from public directory
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sanitize input
app.use(sanitizeInput);

// logging requests
app.use(morgan("dev"));

// health check
app.get("/", (_, res) =>
  API_RESPONSE.SUCCESS(res, 200, "Server is healthy", { ok: true })
);

// app routes
app.use("/api", appRouter);

// error handlers
app.use(errorHandler);
app.use(notFoundHandler);

export default app;
