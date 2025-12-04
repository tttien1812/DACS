// zaloPayController.js
import zaloPayService from "../services/zaloPayService";

let handleGetZaloPayByBookingId = async (req, res) => {
  try {
    let data = await zaloPayService.getZaloPayByBookingId(req.query.bookingId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(">>> CONTROLLER ERROR: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleGetBookingReason = async (req, res) => {
  try {
    let bookingId = req.query.bookingId;

    if (!bookingId) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu bookingId",
      });
    }

    let result = await zaloPayService.getBookingReasonById(bookingId);
    return res.status(200).json(result);
  } catch (e) {
    console.log("Lỗi API getBookingReason:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi server",
    });
  }
};

let handleCalculateFinalBill = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu bookingId",
      });
    }

    const result = await zaloPayService.calculateFinalBill(bookingId);
    return res.status(200).json(result);
  } catch (e) {
    console.log("Lỗi Final Bill:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi server",
    });
  }
};

let handleGetFinalBillByBookingId = async (req, res) => {
  try {
    let bookingId = req.query.bookingId;

    let data = await zaloPayService.getFinalBillByBookingId(bookingId);

    return res.status(200).json(data);
  } catch (e) {
    console.log("Error final bill API: ", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

module.exports = {
  handleGetZaloPayByBookingId,
  handleGetBookingReason,
  handleCalculateFinalBill,
  handleGetFinalBillByBookingId,
};
