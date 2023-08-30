const Revenue = require("./revenue");
const UserInformation = require("./user-information");
const BookingClinic = require("./booking-clinic");
const OrderClinic = require("./order-clinic");
const RevenueClinic = require("./revenue-clinic");
const TopSaler = require("./top-saler");
const UserClinic = require("./user-clinic");
const StaffAttendance = require("./staff-attendence");

const FUNCTION_CALLS = {
  [`${Revenue.rpcFunctionName}`]: Revenue.exec,
  [`${UserInformation.rpcFunctionName}`]: UserInformation.exec,
  [`${BookingClinic.rpcFunctionName}`]: BookingClinic.exec,
  [`${OrderClinic.rpcFunctionName}`]: OrderClinic.exec,
  [`${RevenueClinic.rpcFunctionName}`]: RevenueClinic.exec,
  [`${TopSaler.rpcFunctionName}`]: TopSaler.exec,
  [`${UserClinic.rpcFunctionName}`]: UserClinic.exec,
  [`${StaffAttendance.rpcFunctionName}`]: StaffAttendance.exec,
};
const FUNCTION_SCHEMES = [
  Revenue.functionScheme,
  UserInformation.functionScheme,
  BookingClinic.functionScheme,
  OrderClinic.functionScheme,
  RevenueClinic.functionScheme,
  TopSaler.functionScheme,
  UserClinic.functionScheme,
  StaffAttendance.functionScheme,
];

module.exports = { FUNCTION_CALLS, FUNCTION_SCHEMES };
