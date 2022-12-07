const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
require("dotenv").config({
  path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`),
});
const port = process.env.PORT || 3000;
app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("short"));
var dir = path.join(__dirname, "public");
app.use(express.static(dir));
//create server
const paymeRouter = require("./routers/payme.route");
app.use((req, res, next) => {
  res.io = io;
  next();
});
app.disable("etag");
app.get("/", (req, res) => {
  res.status(200).send({
    data: "Welcome,Aura",
  });
});
app.get("/favicon.ico", function (req, res) {
  res.sendStatus(204);
});
app.get("/healthcheck", (req, res) => {
  res.status(200).send({
    data: "Welcome,Aura",
  });
});
app.use("/api/v1/payme", paymeRouter);
app.use((err, req, res, next) => {
  console.log(err);
  console.log(err.message);
  return res.status(err?.statusCode ? err?.statusCode : 404).send({
    status: err.status,
    message: err.message,
  });
});
//socket
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://zalo.me/s/2746253485825640226",
      "https://zalo.me/s/2746253485825640226/?env=TESTING&version=51",
    ],
    transports: ["websocket"],
    secure: true,
    cors: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("client_connect");
  // socket.on("join_booking", (bookingIdRoom) => {
  //   console.log(bookingIdRoom);
  //   socket.join(bookingIdRoom);
  //   // socket.room = room;

  //   io.to(room).emit("viewer", io.sockets.adapter.rooms.get(room).size);
  // });
});

server.listen(port, () => {
  console.log(new Date(Date.now()).toString());
  console.log("healthcheck");
  console.log(`Example app pro listening on port ${port}`);
});
