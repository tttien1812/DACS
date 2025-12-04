// zaloPayService.js
import db from "../models/index";

let getZaloPayByBookingId = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId) {
        return resolve({
          errCode: 1,
          errMessage: "Missing bookingId",
        });
      }

      let result = await db.ZaloPayPayment.findAll({
        where: {
          bookingId: bookingId,
          status: "SUCCESS",
        },
        include: [
          {
            model: db.Booking,
            as: "bookingData",
            attributes: ["id", "date", "timeType", "statusID"],
          },
          {
            model: db.User,
            as: "userData",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
        raw: false,
        nest: true,
      });

      return resolve({
        errCode: 0,
        data: result,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getBookingReasonById = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let booking = await db.Booking.findOne({
        where: { id: bookingId },
        attributes: ["id", "reason"], // chỉ lấy id và reason
      });

      if (!booking) {
        return resolve({
          errCode: 1,
          errMessage: "Booking không tồn tại",
        });
      }

      resolve({
        errCode: 0,
        data: booking,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let calculateFinalBill = async (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Lấy Booking
      let booking = await db.Booking.findOne({
        where: { id: bookingId },
        include: [
          { model: db.User, as: "doctorData" },
          {
            model: db.Invoice,
            as: "invoiceData",
            include: [{ model: db.InvoiceItem, as: "items" }],
          },
          { model: db.ZaloPayPayment, as: "paymentData" },
        ],

        // ⭐ Thêm 2 dòng bạn yêu cầu
        raw: false,
        nest: true,
      });

      if (!booking) {
        return resolve({
          errCode: 1,
          errMessage: "Booking không tồn tại",
        });
      }

      // 2. Lấy phí khám từ Allcode dựa vào priceID của bác sĩ
      const doctorInfo = await db.Doctor_Infor.findOne({
        where: { doctorId: booking.doctorID },
        include: [
          {
            model: db.Allcode,
            as: "priceTypeData",
            attributes: ["valueVI"],
          },
        ],
        raw: false,
        nest: true,
      });

      const examFee = Number(doctorInfo?.priceTypeData?.valueVI || 0);

      // 3. Tổng tiền thuốc từ Invoice
      const totalPrice = Number(booking.invoiceData?.totalPrice || 0);

      // 4. Kiểm tra thanh toán trước từ ZaloPay
      const depositAmount = Number(booking.paymentData?.amount || 0);
      const hasPaidBefore =
        booking.paymentData && booking.paymentData.status === "success";

      let finalAmount = 0;
      let remainingAmount = 0;

      if (!hasPaidBefore) {
        // ❌ KHÔNG thanh toán trước
        finalAmount = examFee + totalPrice;
        remainingAmount = finalAmount;
      } else {
        // ✅ ĐÃ thanh toán trước
        finalAmount = totalPrice;
        remainingAmount = totalPrice - depositAmount;

        if (remainingAmount < 0) remainingAmount = 0;
      }

      await db.FinalBill.create({
        userId: booking.patientID,
        bookingId: booking.id,
        invoiceId: booking.invoiceData?.id,

        examinationFee: examFee,
        medicineFee: totalPrice,
        depositAmount: depositAmount,
        finalAmount: finalAmount,
        remainingAmount: remainingAmount,

        status: remainingAmount === 0 ? "paid" : "pending",
      });

      return resolve({
        errCode: 0,
        data: {
          bookingId,
          examFee,
          totalPrice,
          depositAmount,
          hasPaidBefore,
          finalAmount,
          remainingAmount,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getFinalBillByBookingId = async (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId) {
        return resolve({
          errCode: 1,
          errMessage: "Missing bookingId",
        });
      }

      let finalBill = await db.FinalBill.findOne({
        where: { bookingId: bookingId },
        include: [
          {
            model: db.Invoice,
            as: "invoiceData",
            include: [{ model: db.InvoiceItem, as: "items" }],
          },
          {
            model: db.Booking,
            as: "bookingData",
            // include: [
            //   { model: db.User, as: "patientData" },
            //   { model: db.User, as: "doctorData" },
            // ],
          },
        ],
        raw: false,
        nest: true,
      });

      if (!finalBill) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy FinalBill cho bookingId này",
        });
      }

      return resolve({
        errCode: 0,
        data: finalBill,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getZaloPayByBookingId,
  getBookingReasonById,
  calculateFinalBill,
  getFinalBillByBookingId,
};
