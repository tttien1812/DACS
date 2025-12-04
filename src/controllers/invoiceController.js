// controllers/invoiceController.js
import invoiceService from "../services/invoiceService";

let createInvoice = async (req, res) => {
  try {
    let data = req.body;
    let response = await invoiceService.createInvoiceService(data);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleGetInvoiceByBooking = async (req, res) => {
  try {
    const { bookingId } = req.query;

    const data = await invoiceService.getInvoiceByBookingId(bookingId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(">>> CONTROLLER ERROR:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

module.exports = {
  createInvoice,
  handleGetInvoiceByBooking,
};
