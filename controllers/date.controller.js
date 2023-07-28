class DateController {
    getCurrentTime = (req, res) => {
        try {
            let now = new Date();
            var vnDate = now.toLocaleDateString("en-US", {
                timeZone: "Asia/Ho_Chi_Minh",
            });
            var vnTime = now.toLocaleTimeString("en-US", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false,
            });
            res.status(200).json({ date: vnDate, time: vnTime });
        } catch (error) {
            res.status(404).json({ message: "Error" });
        }
    };
}
module.exports = new DateController();
