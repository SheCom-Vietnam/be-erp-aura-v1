const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const admin = require("firebase-admin");
var serviceAccount = require("./auralt-firebase-adminsdk-j7xv1-bb162b29c1.json");
const connectMeilisearch = require("./config/supabaseConnetMeilisearch");
const app = express();
const cron = require("node-cron");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
console.log(path.join(__dirname, `./.env.${process.env.NODE_ENV}`));
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

// conenct melisearch
// connectMeilisearch(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SEVICE_KEY,
//   process.env.MEILISEARCH_HOST,
//   process.env.MEILISEARCH_KEY,
//   "users",
//   "users"
// );
//create server
const paymeRouter = require("./routers/payme.route");
const pushnotifyRouter = require("./routers/pushnotify.route");
const zaloRouter = require("./routers/oaZalo.route");
const pancakeRouter = require("./routers/pancake.route");
const authRouter = require("./routers/auth.route");
const omiCallRouter = require("./routers/omicall.route");
const storageRouter = require("./routers/storage.route");
const larkRouter = require("./routers/lark.route");
const meilisearchRouter = require("./routers/meilisearch.route");
const elasticsearchRouter = require("./routers/elasticsearch.route");
const streamRouter = require("./routers/stream.route");
const easygopRouter = require("./routers/easygop.route");
const miniappRouter = require("./routers/miniapp.route");
const dateRouter = require("./routers/date.route");

//Gửi thông báo theo thời gian cố định của chức năng chấm công
// const scheduler = require("./helpers/scheduler");
// scheduler.runSchedule();

app.use((req, res, next) => {
    res.io = io;
    next();
});
app.disable("etag");
app.get("/", (req, res) => {
    res.status(200).send({
        data: "Welcome,Auraa",
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

app.get("/test", (req, res) => {
    res.status(200).send({
        data: "Welcome,Aura test",
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
app.use("/api/v1/meilisearch", meilisearchRouter);
app.use("/api/v1/elasticsearch", elasticsearchRouter);
app.use((err, req, res, next) => {
    console.log(err.message);
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
            "https://aura-dev.shecom.asia",
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
//stream
app.use("/api/v1/stream", streamRouter);

//easygop
app.use("/api/v1/easygop", easygopRouter);
//date
app.use("/api/v1/date", dateRouter);

//mini app hook
app.use("/api/v1/miniapp-hook/", miniappRouter);
var os = require("os");

// ZNS
const {
    znsRemindBooking,
    znsAfterService,
    znsAfterService30Days,
} = require("./services/znsZalo.services");
cron.schedule("0 2 * * *", async function () {
    console.log("---------------------");
    await znsRemindBooking();
    await znsAfterService();
    await znsAfterService30Days();
});
// cron.schedule("*/5 * * * * *", async function () {
//     console.log("---------------------");
//     await znsRemindBooking();
//     await znsAfterService();
//     await znsAfterService30Days();
// });
server.listen(port, () => {
    console.log(new Date(Date.now()).toString());
    console.log(`Example app listening on port ${port}`);
});
