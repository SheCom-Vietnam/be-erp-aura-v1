const catchAsync = require("../helpers/catchAsync");
const elasticsearch = require("../config/elasticsearch");
const PAGE_SIZE = 100
class elasticsearchController {
    searchOrders = catchAsync(async (req, res, next) => {
        try {
            const { text } = req.body
            const body = await elasticsearch.search({
                index: 'orders',
                body: {
                    size: PAGE_SIZE,
                    query: {
                        bool: {
                            should: [
                                {
                                    match_phrase_prefix: {
                                        id: {
                                            query: text
                                        }
                                    }
                                },
                                {
                                    match_phrase_prefix: {
                                        user_phone: {
                                            query: text
                                        }
                                    }
                                },
                                {
                                    match_phrase_prefix: {
                                        user_name: {
                                            query: text
                                        }
                                    }
                                }
                            ]
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
                    size: PAGE_SIZE,
                    query: {
                        bool: {
                            should: [
                                {
                                    match_phrase_prefix: {
                                        id: {
                                            query: text
                                        }
                                    }
                                },
                                {
                                    match_phrase_prefix: {
                                        user_phone: {
                                            query: text
                                        }
                                    }
                                },
                                {
                                    match_phrase_prefix: {
                                        user_name: {
                                            query: text
                                        }
                                    }
                                }
                            ]
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
                index: 'users',
                body: {
                    size: PAGE_SIZE,
                    query: {
                        bool: {
                            should: [
                                {
                                    match_phrase_prefix: {
                                        name: {
                                            query: text
                                        }
                                    }
                                },
                                {
                                    match_phrase_prefix: {
                                        phone: {
                                            query: text
                                        }
                                    }
                                }
                            ]
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
