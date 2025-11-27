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

module.exports = {
  createInvoice,
};
