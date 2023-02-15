const vngStorageServices = require("../services/vngStorage.services");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const axios = require("axios");

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
}
module.exports = new VngStorageController();
