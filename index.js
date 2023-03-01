const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const admin = require("firebase-admin");
var serviceAccount = require("./auralt-firebase-adminsdk-j7xv1-bb162b29c1.json");

const app = express();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("dotenv").config({
  path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`),
});
const port = process.env.PORT || 8000;
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
const pushnotifyRouter = require("./routers/pushnotify.route");
const zaloRouter = require("./routers/oaZalo.route");
const pancakeRouter = require("./routers/pancake.route");
const authRouter = require("./routers/auth.route");
const omiCallRouter = require("./routers/omicall.route");
const storageRouter = require("./routers/storage.route");
const larkRouter = require("./routers/lark.route");
app.use((req, res, next) => {
  res.io = io;
  next();
});
app.disable("etag");
app.get("/", (req, res) => {
  res.status(200).send({
    data: "Welcome,Aura Production",
  });
});
app.get("/favicon.ico", function (req, res) {
  res.sendStatus(204);
});
app.get("/healthcheck", (req, res) => {
  res.status(200).send({
    data: "Welcome,Aura Production",
  });
});
app.use("/api/v1/payme", paymeRouter);
app.use("/api/v1/pushnotify", pushnotifyRouter);
app.use("/api/v1/zalo", zaloRouter);
app.use("/api/v1/pancake", pancakeRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/omicall", omiCallRouter);
app.use("/api/v1/storage", storageRouter);
app.use("/api/v1/lark", larkRouter);
app.use((err, req, res, next) => {
  console.log(err);
  // console.log(err.message);
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
      "https://zalo.me/s/2746253485825640226",
      "https://aura.shecom.asia",
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
  console.log("join_connect");
});

var os = require("os");
server.listen(port, () => {
  console.log(new Date(Date.now()).toString());
  console.log(`Example app listening on port ${port}`);
});
