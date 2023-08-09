const axios = require("axios");
const supabase = require("../config/supabase");

const {
    sendZNS,
    listTemplateIds,
    generateTrackingId,
} = require("../utils/znsReq");
const ZNS_URL =
    "http://rest.esms.vn/MainService.svc/json/SendZaloMessage_V4_post_json/"; //Vihat

const OAID_CONFIRM_BOOKING = "1783272961339323129";
const OAID_WELCOME_STAFF = "3003135941649408838";

function convertPhoneNumber(phoneNumber) {
    if (phoneNumber.startsWith("0")) {
        return "84" + phoneNumber.slice(1);
    }
    return phoneNumber;
}
function formatDate(date) {
    if (date) {
        try {
            let temp = date.split("-");
            return temp[2] + "-" + temp[1] + "-" + temp[0];
        } catch (error) {
            return null;
        }
    }
    return null;
}
function addDaysFromNow(numOfDays = 0, date = new Date()) {
    date.setDate(date.getDate() + numOfDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
const znsConfirmBookingTemplate = async ({ phone, templateConfig }) => {
    try {
        const response = await axios({
            url: ZNS_URL,
            method: "POST",
            data: {
                ApiKey: process.env.SMS_API_KEY,
                SecretKey: process.env.SMS_SECRECT_KEY,
                Phone: phone,
                Params: templateConfig, //theo thứ tư[customName, clinicName,serviceName, dateTime, bookingID, clinicName, address]
                TempID: "249881",
                OAID: OAID_CONFIRM_BOOKING,
            },
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
const znsCallConfirmation = async (bookingID) => {
    try {
        let { data: bookingInfo } = await supabase
            .from("bookings")
            .select("*,service_id(*),clinic_id(*),order_id(user_id(*))")
            .eq("id", bookingID)
            .single();
        if (bookingInfo) {
            console.log("Call confirmation");
            let trackingId = generateTrackingId(
                bookingID,
                convertPhoneNumber(bookingInfo.order_id.user_id.phone)
            );
            let response = await sendZNS(
                "TMV-OA",
                convertPhoneNumber(bookingInfo.order_id.user_id.phone),
                listTemplateIds.callConfirmation,
                { customerName: bookingInfo.order_id.user_id.name },
                trackingId
            );
            console.log(response);
            return response;
        }
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
const znsRemindBooking = async () => {
    try {
        let { data: bookings } = await supabase
            .from("bookings")
            .select("*,service_id(*),clinic_id(*),order_id(user_id(*))");
        if (bookings) {
            console.log("ZNS remind booking");
            let filterBookings = bookings.filter(
                (booking) => booking.date == addDaysFromNow(1)
            );
            for (let i = 0; i < filterBookings.length; i++) {
                const phone = convertPhoneNumber(
                    filterBookings[i].order_id.user_id.phone
                );
                const templateData = {
                    customerName: filterBookings[i].order_id.user_id.name,
                    clinicName: filterBookings[i].clinic_id.name,
                    address: filterBookings[i].clinic_id.address,
                    serviceName: filterBookings[i].service_id.name,
                    dateTime:
                        filterBookings[i].time +
                        " ngày " +
                        formatDate(filterBookings[i].date),
                    note: filterBookings[i].description || "không có ghi chú.",
                    bookingID: filterBookings[i].id,
                };
                if (
                    phone &&
                    templateData.customerName &&
                    templateData.clinicName &&
                    templateData.address &&
                    templateData.serviceName &&
                    templateData.dateTime &&
                    templateData.note &&
                    templateData.bookingID
                ) {
                    let trackingId = generateTrackingId(
                        templateData.bookingID,
                        phone
                    );
                    let response = await sendZNS(
                        "TMV-OA",
                        phone,
                        listTemplateIds.remindTemplate,
                        templateData,
                        trackingId
                    );
                }
            }
        }
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
const znsAfterService = async () => {
    try {
        let { data: bookings } = await supabase
            .from("bookings")
            .select(
                "*,service_id(*,category_id(*)),clinic_id(*),order_id(user_id(*))"
            );
        if (bookings) {
            console.log("ZNS After service");
            let filterBookings = bookings.filter(
                (booking) =>
                    addDaysFromNow() ==
                    addDaysFromNow(7, new Date(booking.date))
                //booking.date == "2024-08-08"
            );
            for (let i = 0; i < filterBookings.length; i++) {
                const phone = convertPhoneNumber(
                    filterBookings[i].order_id.user_id.phone
                );
                const templateData = {
                    customerName: filterBookings[i].order_id.user_id.name,
                    clinicName: filterBookings[i].clinic_id.name,
                    address: filterBookings[i].clinic_id.address,
                    serviceName: filterBookings[i].service_id.name,
                    dateTime:
                        filterBookings[i].time +
                        " ngày " +
                        formatDate(filterBookings[i].date),
                    note: filterBookings[i].description || "không có ghi chú.",
                    bookingID: filterBookings[i].id,
                };

                if (
                    phone &&
                    templateData.customerName &&
                    templateData.clinicName &&
                    templateData.address &&
                    templateData.serviceName &&
                    templateData.dateTime &&
                    templateData.note &&
                    templateData.bookingID
                ) {
                    let trackingId = generateTrackingId(
                        filterBookings[i].bookingID,
                        phone
                    );
                    if (
                        filterBookings[i].service_id.category_id.name.includes(
                            "Phun Xăm"
                        ) &&
                        filterBookings[i].service_id.category_id.name !=
                            "Đào tạo - Phun xăm"
                    ) {
                        let response = await sendZNS(
                            "TMV-OA",
                            phone,
                            listTemplateIds.afterTatooServiceTemplate,
                            {
                                customerName: templateData.customerName,
                                clinicName: templateData.clinicName,
                            },
                            trackingId
                        );
                    }

                    if (
                        filterBookings[i].service_id.category_id.name.includes(
                            "PTTM"
                        )
                    ) {
                        let response = await sendZNS(
                            "TMV-OA",
                            phone,
                            listTemplateIds.afterPTTMServiceTemplate,
                            {
                                customerName: templateData.customerName,
                                clinicName: templateData.clinicName,
                                serviceName: templateData.serviceName,
                            },
                            trackingId
                        );
                    }
                    if (
                        filterBookings[i].service_id.category_id.name.includes(
                            "Nám"
                        )
                    ) {
                        let response = await sendZNS(
                            "TMV-OA",
                            phone,
                            listTemplateIds.afterMelasmaServiceTemplate,
                            {
                                customerName: templateData.customerName,
                                clinicName: templateData.clinicName,
                                serviceName: templateData.serviceName,
                            },
                            trackingId
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
const znsCheckoutTemplate = async ({ paid, orderID }) => {
    try {
        let { data: bookingInfo } = await supabase
            .from("bookings")
            .select("*,service_id(*),clinic_id(*),order_id(user_id(*))")
            .eq("order_id", orderID)
            .single();

        if (bookingInfo) {
            let trackingId = generateTrackingId(
                orderID,
                convertPhoneNumber(bookingInfo.order_id.user_id.phone)
            );
            let response = await sendZNS(
                "TMV-OA",
                convertPhoneNumber(bookingInfo.order_id.user_id.phone),
                listTemplateIds.checkoutTemplate,
                {
                    clinicName: bookingInfo.clinic_id.name,
                    customerName: bookingInfo.order_id.user_id.name,
                    paid,
                    orderID,
                },
                trackingId
            );
            return response;
        }
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
const znsBookingConfirmationV2 = async (bookingID) => {
    try {
        let { data: bookingInfo } = await supabase
            .from("bookings")
            .select("*,service_id(*),clinic_id(*),order_id(user_id(*))")
            .eq("id", bookingID)
            .single();

        if (bookingInfo) {
            let trackingId = generateTrackingId(
                bookingID,
                convertPhoneNumber(bookingInfo.order_id.user_id.phone)
            );
            let response = await sendZNS(
                "TMV-OA",
                convertPhoneNumber(bookingInfo.order_id.user_id.phone),
                listTemplateIds.bookingConfirmation,
                {
                    customerName: bookingInfo.order_id.user_id.name,
                    serviceName: bookingInfo.service_id.name,
                    clinicName: bookingInfo.clinic_id.name,
                    dateTime:
                        bookingInfo.time +
                        " ngày " +
                        formatDate(bookingInfo.date),
                    address: bookingInfo.clinic_id.address,
                    bookingID,
                },
                trackingId
            );
            return response;
        }
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
const znsWelcomeStaffTemplate = async ({ phone, templateConfig }) => {
    try {
        const response = await axios({
            url: ZNS_URL,
            method: "POST",
            data: {
                ApiKey: process.env.SMS_API_KEY,
                SecretKey: process.env.SMS_SECRECT_KEY,
                Phone: phone,
                Params: templateConfig, //theo thứ tư[Tên KH,Tỉnh thành chi nhánh,Thời gian,BookingId,Ghi chú,Địa chỉ chi nhánh,BookingLink]
                TempID: "249919",
                OAID: OAID_WELCOME_STAFF,
            },
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
};
module.exports = {
    znsConfirmBookingTemplate,
    znsWelcomeStaffTemplate,
    znsRemindBooking,
    znsCheckoutTemplate,
    znsAfterService,
    znsBookingConfirmationV2,
    znsCallConfirmation,
};
