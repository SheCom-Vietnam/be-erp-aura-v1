const axios = require("axios");
const moment = require("moment");
const supabase = require("../config/supabase");

const ZALO_ZNS_URL = "https://business.openapi.zalo.me/message/template";

const listTemplateIds = {
    remindTemplate: "275553",
    checkoutTemplate: "275692",
    afterTatooServicesTemplate: "275599",
    afterPTTMServicesTemplate: "275622",
    afterMelasmaServicesTemplate: "275746",
    callConfirmation: "275654",
    bookingConfirmation: "275666",
    afterServices30days: "275856",
};
function generateTrackingId(bookingId, phone) {
    // Get the current date
    const currentDate = new Date();

    // Extract the day, month, and year components
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = currentDate.getFullYear();

    // Create the formatted date string
    const formattedDate = `${day}-${month}-${year}`;

    return bookingId + "/" + phone + "/" + formattedDate;
}
const getReqBody = (phone, templateId, templateData, trackingId) => {
    if (process.env.NODE_ENV == "dev") {
        return {
            mode: "development",
            phone: phone,
            template_id: templateId,
            template_data: { ...templateData },
            tracking_id: trackingId,
        };
    }
    return {
        phone: phone,
        template_id: templateId,
        template_data: { ...templateData },
        tracking_id: trackingId,
    };
};
module.exports = {
    sendZNS: async (OANAME, phone, templateId, templateData, trackingId) => {
        let { data: oaTokens } = await supabase
            .from("oa_token")
            .select("access_token,oa_name");
        let accessToken = "";
        for (let i = 0; i <= oaTokens.length; i++) {
            if (oaTokens[i].oa_name == OANAME) {
                accessToken = oaTokens[i].access_token;
                break;
            }
        }
        let response = await await axios({
            url: ZALO_ZNS_URL,
            method: "POST",
            data: {
                ...getReqBody(phone, templateId, templateData, trackingId),
            },
            headers: {
                "Content-Type": "application/json",
                access_token: accessToken,
            },
        });
        return response;
    },
    listTemplateIds,
    generateTrackingId,
};
