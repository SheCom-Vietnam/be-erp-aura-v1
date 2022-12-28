const vngStorageServices = require("../services/vngStorage.services");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const axios = require("axios");
const fs = require("fs");
const downloadFile = async (url, fileName) => {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    try {
      const fileStream = fs.createWriteStream(
        `${__dirname}/data/${fileName}.mp3`
      );
      response.data.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
        console.log("done");
      });
      fileStream.on("error", (error) => {
        fileStream.close();
        reject();
        console.error("Error" + error);
      });
    } catch (error) {
      console.error("Error", error);
    }
  });
};

class VngStorageController {
  getAccesskey = catchAsync(async (req, res, next) => {
    const response = await vngStorageServices.getAccessKey();
    return res.status(200).send({
      status: "Success",
      data: {
        token: response.access_token,
      },
    });
  });
  uploadLoadToVng = catchAsync(async (req, res, next) => {
    // downloadFile(
    //   "https://public-v1-stg.omicrm.com/third_party/recording/uc?id=UWJ5N2JRdTlHa0NJUzEvZktxTlNDZmVlVEVuMkgzUTZNZWpDTDdsVlZQNnBXZWk4QjZTVWxPTlhiWkhYaDR4VGtQZ003anpsS01rMm9OUFJ0RnVOU2c9PQ==",
    //   "123"
    // );
    const response = await axios.get(
      "https://public-v1-stg.omicrm.com/third_party/recording/uc?id=UWJ5N2JRdTlHa0NJUzEvZktxTlNDZmVlVEVuMkgzUTZNZWpDTDdsVlZQNnBXZWk4QjZTVWxPTlhiWkhYaDR4VGtQZ003anpsS01rMm9OUFJ0RnVOU2c9PQ==",
      { responseType: "stream" }
    );
    const upload = await vngStorageServices.upload(response.data, "demo.123");
    console.log(upload);
  });
}
module.exports = new VngStorageController();
