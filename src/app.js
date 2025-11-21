import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import appRouter from "./router.js";
import { API_RESPONSE } from "./utils/ApiResponse.js";
import { sanitizeInput } from "./middleware/sanitizer.middleware.js";

const app = express();

// security headers
app.use(helmet());
app.use(cors({ origin: "*" }));

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
