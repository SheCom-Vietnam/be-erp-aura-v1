const catchAsync = require("../helpers/catchAsync");
const elasticsearch = require("../config/elasticsearch");

class elasticsearchController {
    searchOrders = catchAsync(async (req, res, next) => {
        try {
            const { text } = req.body
            const body = await elasticsearch.search({
                index: 'orders',
                body: {
                    query: {
                        multi_match: {
                            query: text,
                            fields: ["id", "user_name", "user_phone"]
                        }
                    },
                },
            });
            console.log(body.hits.hits);
            if (body && body.hits && body.hits.hits) {
                return res.status(200).send({
                    status: "Success",
                    data: body.hits.hits
                });
            }
        } catch (error) {
            console.error(error);
            return next(new AppError(error, 400));
        }
    });
    searchBookings = catchAsync(async (req, res, next) => {
        try {
            const { text } = req.body
            const body = await elasticsearch.search({
                index: 'bookings',
                body: {
                    query: {
                        multi_match: {
                            query: text,
                            fields: ["id", "user_name", "user_phone", "clinic_name", "staff_name"]
                        }
                    },
                },
            });
            console.log(body.hits.hits);
            if (body && body.hits && body.hits.hits) {
                return res.status(200).send({
                    status: "Success",
                    data: body.hits.hits
                });
            }
        } catch (error) {
            console.error(error);
            return next(new AppError(error, 400));
        }
    });

    searchUsers = catchAsync(async (req, res, next) => {
        try {
            const { text } = req.body
            const body = await elasticsearch.search({
                index: 'bookings',
                body: {
                    query: {
                        multi_match: {
                            query: text,
                            fields: ["name", "phone"]
                        }
                    },
                },
            });
            console.log(body.hits.hits);
            if (body && body.hits && body.hits.hits) {
                return res.status(200).send({
                    status: "Success",
                    data: body.hits.hits
                });
            }
        } catch (error) {
            console.error(error);
            return next(new AppError(error, 400));
        }
    });
}

module.exports = new elasticsearchController();
