import database from "./config/database.js";
import "./utils/UploadDirectories.js";
import app from "./app.js";

// self start express engine
(async () => {
  try {
    // connect to database
    await database.connect();

    // start server
    app.listen(process.env.PORT, () => {
      console.log(
        `🚀 Server is running on http://localhost:${process.env.PORT}`
      );
    });

    // graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await database.disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
