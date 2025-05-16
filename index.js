import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import databaseConfig from "./src/config/db.js";
import cookieParser from 'cookie-parser'; 


//ROUTES
import authRoutes from "./src/routes/authRoute.js";
import sliderRoutes from "./src/routes/sliderRoutes.js"
import serviceRoutes from "./src/routes/serviceRoutes.js"
import packageRoutes from "./src/routes/packageRoutes.js"

import "./src/config/passport.js";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
//ORIGIN CONFIG
const corsOptions = {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5000",
      "*"
    ],
    credentials: true,
  };

 //CORS MIDDLEWARE
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(databaseConfig); 
app.use(express.json());
app.use(compression());
app.use(morgan("dev")); 

// API to serve a file by filename
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(404).json({ message: "File not found" });
    }
  });
});

// API routes
app.use("/", authRoutes);
app.use("/slider", databaseConfig, sliderRoutes)
app.use("/service", databaseConfig, serviceRoutes)
app.use("/package",databaseConfig, packageRoutes)

// graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));