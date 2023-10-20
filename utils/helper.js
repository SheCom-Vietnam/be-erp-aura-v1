const convertVND = (number) => {
    if (typeof number !== "number") {
      return "Invalid input";
    }
  
    const formattedNumber = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(number);
  
    return formattedNumber;
  };
  
  const formatYYYYMMDD = (p_date) => {
    const year = p_date.getFullYear();
    const month = String(p_date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const day = String(p_date.getDate()).padStart(2, "0");
  
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };
  
  function formatDDMMYYYY(p_date) {
    const day = p_date.getDate().toString().padStart(2, "0");
    const month = (p_date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = p_date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  module.exports = { convertVND, formatYYYYMMDD, formatDDMMYYYY };