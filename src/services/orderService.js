// const axios = require("axios");
// const dayjs = require("dayjs");
// const zaloConfig = require("../config/zalopayConfig");

// class OrderService {
//   async createOrder({
//     items,
//     description,
//     amount,
//     patientName,
//     patientEmail,
//     animal,
//     doctorName,
//     date,
//     time,
//   }) {
//     try {
//       const now = dayjs();
//       const app_time = now.valueOf();
//       const app_trans_id = `${now.format("YYMMDD")}_${app_time}`;

//       // embed_data chứa thông tin KH + booking
//       const embed_data = JSON.stringify({
//         patientName,
//         patientEmail,
//         animal,
//         doctorName,
//         date,
//         time,
//       });

//       const item = JSON.stringify(items);

//       const data = {
//         app_id: zaloConfig.app_id,
//         app_user: "demo",
//         app_trans_id,
//         app_time,
//         amount,
//         description,
//         bank_code: "zalopayapp",
//         embed_data,
//         item,
//       };

//       data.mac = zaloConfig.createMac(data, zaloConfig.key1);

//       const response = await axios.post(zaloConfig.endpoint, data, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (response.data.return_code === 1) {
//         return response.data;
//       } else {
//         throw response.data;
//       }
//     } catch (err) {
//       throw err;
//     }
//   }
// }
// module.exports = new OrderService();

//-------------------------------------------------------------------
// const axios = require("axios");
// const dayjs = require("dayjs");
// const zaloConfig = require("../config/zalopayConfig");
// const db = require("../models");

// class OrderService {
//   async createOrder({
//     items,
//     description,
//     amount,
//     bookingId,
//     userId,
//     patientName,
//     patientEmail,
//     animal,
//     doctorName,
//     date,
//     time,
//   }) {
//     try {
//       const now = dayjs();
//       const app_time = now.valueOf();
//       const app_trans_id = `${now.format("YYMMDD")}_${app_time}`;

//       // embed_data chứa thông tin KH + booking
//       const embed_data = JSON.stringify({
//         patientName,
//         patientEmail,
//         animal,
//         doctorName,
//         date,
//         time,
//         bookingId,
//         userId,
//       });

//       const item = JSON.stringify(items);

//       const data = {
//         app_id: zaloConfig.app_id,
//         app_user: "demo",
//         app_trans_id,
//         app_time,
//         amount,
//         description,
//         bank_code: "zalopayapp",
//         embed_data,
//         item,
//       };

//       data.mac = zaloConfig.createMac(data, zaloConfig.key1);

//       const response = await axios.post(zaloConfig.endpoint, data, {
//         headers: { "Content-Type": "application/json" },
//       });

//       // ==============================
//       // 🔥 LƯU XUỐNG DB ZALOPAYMENT
//       // ==============================
//       await db.ZaloPayPayment.create({
//         bookingId: bookingId,
//         userId: userId,
//         amount: amount,
//         description: description,
//         orderId: app_trans_id,
//         zpTransId: null,
//         status: response.data.return_code === 1 ? "PENDING" : "FAILED",
//         rawData: JSON.stringify(response.data),
//       });

//       // ==============================
//       // 🔥 GIỮ NGUYÊN LOGIC GỐC
//       // ==============================
//       if (response.data.return_code === 1) {
//         return response.data;
//       } else {
//         throw response.data;
//       }
//     } catch (err) {
//       throw err;
//     }
//   }
// }

// module.exports = new OrderService();

//-------------------------------------------------------------------
const axios = require("axios");
const crypto = require("crypto");
const dayjs = require("dayjs");
const zaloConfig = require("../config/zalopayConfig");
const db = require("../models");

class OrderService {
  async createOrder({
    items,
    description,
    amount,
    bookingId,
    userId,
    patientName,
    patientEmail,
    animal,
    doctorName,
    date,
    time,
  }) {
    try {
      const now = dayjs();
      const app_time = now.valueOf();
      const app_trans_id = `${now.format("YYMMDD")}_${app_time}`;

      const embed_data = JSON.stringify({
        patientName,
        patientEmail,
        animal,
        doctorName,
        date,
        time,
        bookingId,
        userId,
      });

      const item = JSON.stringify(items);

      const data = {
        app_id: zaloConfig.app_id,
        app_user: "demo",
        app_trans_id,
        app_time,
        amount,
        description,
        bank_code: "zalopayapp",
        embed_data,
        item,
      };

      data.mac = zaloConfig.createMac(data, zaloConfig.key1);

      const response = await axios.post(zaloConfig.endpoint, data, {
        headers: { "Content-Type": "application/json" },
      });

      await db.ZaloPayPayment.create({
        bookingId,
        userId,
        amount,
        description,
        orderId: app_trans_id,
        zpTransId: null,
        status: response.data.return_code === 1 ? "PENDING" : "FAILED",
        rawData: JSON.stringify(response.data),
      });

      // Fake callback tự động update SUCCESS (chỉ test)
      await db.ZaloPayPayment.update(
        { status: "SUCCESS", zpTransId: "FAKE123456" },
        { where: { orderId: app_trans_id } }
      );

      if (response.data.return_code === 1) {
        return { ...response.data, app_trans_id };
      } else {
        throw response.data;
      }
    } catch (err) {
      throw err;
    }
  }

  // ==========================
  // 🔥 Fake callback để test frontend hiển thị PAID
  // ==========================
  async handleFakeCallback(orderId) {
    try {
      const payment = await db.ZaloPayPayment.findOne({ where: { orderId } });
      if (!payment) {
        return { success: false, message: "Không tìm thấy order" };
      }

      payment.status = "SUCCESS"; // cập nhật trạng thái
      payment.zpTransId = `FAKE_${Date.now()}`;
      await payment.save();

      return { success: true, message: "Fake callback thành công" };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // Lấy trạng thái thanh toán
  async getPaymentStatus(orderId) {
    try {
      const payment = await db.ZaloPayPayment.findOne({ where: { orderId } });
      if (!payment) {
        return { success: false, message: "Không tìm thấy order" };
      }

      return { success: true, status: payment.status, data: payment };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
}

module.exports = new OrderService();
