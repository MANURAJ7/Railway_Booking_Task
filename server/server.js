const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const handleSocketConnection = require("./helpers/handleSocketConnection");
const registerUser = require("./helpers/registerUser");
const loginUser = require("./helpers/loginUser");
const bookSeats = require("./helpers/bookSeats");
const newTrain = require("./helpers/newTrain");
const getTrainData = require("./helpers/getTrainData");
const getUserBookings = require("./helpers/getUserBookings");
const app = express();
const httpServer = http.createServer(app);
require("dotenv").config();

const port = 3001;

const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:3000`,
    methods: ["GET", "POST"],
  },
});
handleSocketConnection(io);

const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.CA,
  },
};

const pool = new Pool(config);
app.use(cors());
app.use(express.json());

app.post("/auth/register", async (req, res) => {
  registerUser({ req, res, pool });
});

app.post("/getTrainData", async (req, res) => {
  //*
  console.log("get trains data");
  getTrainData({ req, res, pool });
});

app.get("/getUserBookings", async (req, res) => {
  getUserBookings({ req, res, pool });
});

app.post("/auth/login", async (req, res) => {
  //*
  console.log("user tried to login");
  loginUser({ req, res, pool });
});

app.post("/newTrain", async (req, res) => {
  //*
  console.log("admin wants to create new train");
  newTrain({ req, res, pool });
});

app.post("/bookSeats", async (req, res) => {
  console.log("new booking");
  bookSeats({ req, res, pool });
});

httpServer.listen(port, () => {
  console.log(`server started at ${port}`);
});
