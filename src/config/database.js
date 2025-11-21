import mongoose from "mongoose";

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // Mongoose Configuration
      mongoose.set("strictQuery", false);

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(
        process.env.MONGODB_URI,
        options
      );

      console.log(
        `✅ MongoDB Connected: ${this.connection.connection.readyState}`
      );
      console.log(`📊 Database: ${this.connection.connection.name}`);

      // Connection event listeners
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error.message);
      process.exit(1);
    }
  }

  setupEventListeners() {
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing database:", error);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();
