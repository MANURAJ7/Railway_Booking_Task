import express from "express";
import cors from "cors";
import { Server } from "socket.io";
const app = express();

//cors middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//express middlewares
// app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // set behaviour to understand special characters in url

//init SocketIO
import { HandleSocketConnection } from "./utils/HandleSocketConnection.js";
const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:3000`,
    methods: ["GET", "POST"],
  },
});
HandleSocketConnection(io);

// import routes
import TrainsRouter from "./routes/Trains.routes.js";
import BookingsRouter from "./routes/Bookings.routes.js";
import AuthRouter from "./routes/Auth.routes.js";

// routes
app.use("/api/v1/Trains", TrainsRouter);
app.use("/api/v1/Bookings", BookingsRouter);
app.use("/api/v1/Auth", AuthRouter);
export { app };
