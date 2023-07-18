const { default: axios } = require("axios");

const API_KEY = "";
function generateSignature(data, apiKey) {
    const keys = Object.keys(data).sort();
    let content = "";
    for (let k of keys) {
        let value = data[k];
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        content += value;
    }
    const signature = crypto
        .createHash("sha256")
        .update(`${content}${apiKey}`)
        .digest("hex");
    return signature;
}

class MiniAppController {
    hookRevokeConsent = async (req, res, next) => {
        try {
            res.status(200).json({ message: "OK" });
        } catch (e) {
            return next(e);
        }
    };
}
module.exports = new MiniAppController();
