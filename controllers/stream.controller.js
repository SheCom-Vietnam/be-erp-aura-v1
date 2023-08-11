const { Signer } = require("@volcengine/openapi");
const axios = require("axios");
const AppError = require("../helpers/appError");
const bytePlus = require("../utils/bytePlus");
const catchAsync = require("../helpers/catchAsync");
const supabase = require("../config/supabase");
const { upload } = require("../index");
class StreamController {
    CreateActivityAPIV2 = async (req, res, next) => {
        if (req.body.ban === undefined) {
            const { userName, avatar } = req.body;

            console.log(userName);
            const openApiRequestData = {
                region: "ap-singapore-1",
                method: "POST",
                params: {
                    Action: "CreateActivityAPIV2",
                    Version: bytePlus.version,
                },
                headers: {},
                body: JSON.stringify({
                    Name: userName,
                    CoverImage: avatar,
                }),
            };

            const signer = new Signer(openApiRequestData, "livesaas");
            signer.addAuthorization({
                accessKeyId: bytePlus.AKSK.ACCESS_KEY_ID,
                secretKey: bytePlus.AKSK.SECRET_ACCESS_KEY,
            });
            const response = await axios.post(
                `https://open.byteplusapi.com/?Action=CreateActivityAPIV2&Version=${bytePlus.version}`,
                {
                    Name: userName,
                    CoverImage: avatar,
                },
                {
                    headers: openApiRequestData.headers,
                }
            );
            if (!response.data) {
            }
            console.log(response);
            req.bytePlus = response.data.Result;
        }
        next();
    };

    GetStreamsAPI = async (req, res) => {
        if (req.body.ban === undefined) {
            const { ActivityIdStr } = req.bytePlus;
            const openApiRequestData = {
                region: "ap-singapore-1",
                method: "GET",
                params: {
                    Action: "GetStreamsAPI",
                    ActivityId: parseInt(ActivityIdStr),
                    Version: bytePlus.version,
                },
                headers: {},
                body: JSON.stringify(),
            };
            const signer = new Signer(openApiRequestData, "livesaas");
            signer.addAuthorization({
                accessKeyId: bytePlus.AKSK.ACCESS_KEY_ID,
                secretKey: bytePlus.AKSK.SECRET_ACCESS_KEY,
            });

            const response = await axios.get(
                `https://open.byteplusapi.com/?Action=GetStreamsAPI&Version=${
                    bytePlus.version
                }&ActivityId=${parseInt(ActivityIdStr)}`,
                {
                    headers: openApiRequestData.headers,
                }
            );
            if (!response.data) {
                res.status(404).json({ message: "Error" });
            }
            res.status(200).json({
                ...response.data.Result.LineDetails[0].MainPushInfo,
                ActivityIdStr,
            });
        }
    };

    GetToken = async (req, res, next) => {
        const { activityId } = req.query;
        const { AKSK, version } = bytePlus;
        if (!activityId) {
            return res.status(404).json({ message: "Activity not Inval" });
        }
        if (typeof activityId !== "string") {
            return res
                .status(404)
                .json({ message: "Activity not typeof string" });
        }
        const openApiRequestData = {
            region: "ap-singapore-1",
            method: "POST",
            params: {
                Action: "GetSDKTokenAPI",
                Version: version,
            },
            headers: {},
            body: JSON.stringify({
                ActivityId: parseInt(activityId),
                Mode: 1,
            }),
        };
        const signer = new Signer(openApiRequestData, "livesaas");
        signer.addAuthorization({
            accessKeyId: AKSK?.ACCESS_KEY_ID,
            secretKey: AKSK?.SECRET_ACCESS_KEY,
        });

        const response = await axios.post(
            `https://open.byteplusapi.com/?Action=GetSDKTokenAPI&Version=${version}`,
            {
                ActivityId: parseInt(activityId),
                Mode: 1,
            },
            {
                headers: openApiRequestData.headers,
            }
        );
        if (!response) {
            return next(new AppError("Error", 404));
        }
        return res.status(200).send({
            status: "Success",
            data: response.data,
        });
    };

    receiveStatusLive = async (req, res) => {
        const statuses = ["live", "preview", "playback", "over"];
        const { ActivityID, Status, EventType } = req.query;
        if (EventType == "ActivityStatusModifyCallBack") {
            try {
                let { data: updatedStream } = await supabase
                    .from("stream_info")
                    .update({ status: statuses[Status - 1] })
                    .eq("activity_id", ActivityID)
                    .select()
                    .single();
                console.log("updatedStream", updatedStream);
                if (updatedStream && Status == 1) {
                    console.log("Create stream section");
                    await supabase
                        .from("streams_sections")
                        .insert({ stream_id: updatedStream?.id });
                }
                res.status(200).json({ message: statuses[Status - 1] });
            } catch (e) {
                res.status(404).json({ message: "Error" });
            }
        }
    };
    activityAutoReplayCallBack = async (req, res) => {
        const { ActivityID, Vid, EventType } = req.body;
        if (EventType == "ActivityAutoReplayCallBack") {
            try {
                let { data: streamInfo } = await supabase
                    .from("stream_info")
                    .select()
                    .eq("activity_id", ActivityID)
                    .single();
                let { data: currentSection } = await supabase
                    .from("streams_sections")
                    .select()
                    .eq("stream_id", streamInfo.id)
                    .order("created_at", { ascending: false });
                if (streamInfo && currentSection) {
                    console.log("currentSection", currentSection[0]);
                    await supabase
                        .from("streams_sections")
                        .update({
                            video_id: Vid,
                        })
                        .eq("id", currentSection[0].id);
                }
                res.status(200).json({ message: "Okie" });
            } catch (e) {
                res.status(404).json({ message: "Error" });
            }
        }
    };
    getVideoInfoRoute = async (req, res, next) => {
        const { activityId, videoId } = req.body;
        const { AKSK, version } = bytePlus;
        if (!activityId) {
            return res.status(404).json({ message: "Activity not Inval" });
        }
        if (typeof activityId !== "string") {
            return res
                .status(404)
                .json({ message: "Activity not typeof string" });
        }
        const openApiRequestData = {
            region: "ap-singapore-1",
            method: "POST",
            params: {
                Action: "ListPlayUrlsAPI",
                Version: version,
            },
            headers: {},
            body: JSON.stringify({
                Vids: [videoId],
            }),
        };
        const signer = new Signer(openApiRequestData, "livesaas");
        signer.addAuthorization({
            accessKeyId: AKSK?.ACCESS_KEY_ID,
            secretKey: AKSK?.SECRET_ACCESS_KEY,
        });

        const response = await axios.post(
            `http://open.byteplusapi.com/?Action=ListPlayUrlsAPI&Version=${version}`,
            {
                Vids: [videoId],
            },
            {
                headers: openApiRequestData.headers,
            }
        );
        if (!response) {
            return next(new AppError("Error", 404));
        }
        if (response.data && response.data.Result) {
            let videosInfo = response.data.Result.SuccessList;
            return res.status(200).json(videosInfo[0]);
        }
        res.status(404).json({ message: "Error" });
    };
    getVideoInfo = async (activityId, videoId) => {
        const { AKSK, version } = bytePlus;
        if (!activityId) {
            return res.status(404).json({ message: "Activity not Inval" });
        }
        if (typeof activityId !== "string") {
            return res
                .status(404)
                .json({ message: "Activity not typeof string" });
        }
        const openApiRequestData = {
            region: "ap-singapore-1",
            method: "POST",
            params: {
                Action: "ListPlayUrlsAPI",
                Version: version,
            },
            headers: {},
            body: JSON.stringify({
                Vids: [videoId],
            }),
        };
        const signer = new Signer(openApiRequestData, "livesaas");
        signer.addAuthorization({
            accessKeyId: AKSK?.ACCESS_KEY_ID,
            secretKey: AKSK?.SECRET_ACCESS_KEY,
        });

        const response = await axios.post(
            `http://open.byteplusapi.com/?Action=ListPlayUrlsAPI&Version=${version}`,
            {
                Vids: [videoId],
            },
            {
                headers: openApiRequestData.headers,
            }
        );
        if (response.data && response.data.Result) {
            let videosInfo = response.data.Result.SuccessList;
            return videosInfo[0];
        }
        return null;
    };
    uploadImage = async (req, res) => {
        const file = req.file;
        const { activityId } = req.body;

        try {
            let { error } = await supabase.storage
                .from("avatars")
                .upload(`public/${file.originalname}`, file.buffer, {
                    upsert: false,
                });

            const { data } = await supabase.storage
                .from("avatars")
                .getPublicUrl(`public/${file.originalname}`);
            res.status(200).json({ imgUrl: data.publicUrl });
        } catch (e) {
            res.status(404).json({ message: e.message });
        }
    };
}

module.exports = new StreamController();
