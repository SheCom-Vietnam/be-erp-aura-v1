//  84933670101 -> 0933670101
const convertZaloPhoneToPhone = (phone) => {
  if (phone.startsWith("84")) {
    const convert = phone.replace("84", "0");
    return convert;
  } else {
    return phone;
  }
};
// 0933670101 -> 84933670101
const convertPhonetoZaloPhone = (phone) => {
  if (phone.startsWith("0")) {
    const convert = phone.replace("0", "84");
    return convert;
  } else {
    return phone;
  }
};
module.exports = { convertZaloPhoneToPhone, convertPhonetoZaloPhone };
