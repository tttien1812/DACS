// const orderService = require("../services/orderService");

// class OrderController {
//   async createOrder(req, res) {
//     try {
//       const { items, description, amount } = req.body;

//       if (!items || !amount) {
//         return res.status(400).json({
//           errCode: 1,
//           errMessage: "Missing items or amount",
//         });
//       }

//       const result = await orderService.createOrder({
//         items,
//         description,
//         amount,
//       });

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error("Lỗi tạo order ZaloPay:", error.response?.data || error);
//       return res.status(500).json({
//         errCode: -1,
//         errMessage: "Server error",
//         details: errerror.response?.data || error.message || erroror,
//       });
//     }
//   }
// }

// module.exports = new OrderController();

//---------------------------------------------------
// const orderService = require("../services/orderService");
// const db = require("../models");

// class OrderController {
//   async createOrder(req, res) {
//     try {
//       const { items, description, amount } = req.body;

//       if (!items || !amount) {
//         return res.status(400).json({
//           errCode: 1,
//           errMessage: "Missing items or amount",
//         });
//       }

//       const result = await orderService.createOrder(req.body);

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error("Lỗi tạo order ZaloPay:", error.response?.data || error);
//       return res.status(500).json({
//         errCode: -1,
//         errMessage: "Server error",
//       });
//     }
//   }

//   async getPaymentStatus(req, res) {
//     try {
//       const { orderId } = req.query;

//       if (!orderId) {
//         return res.status(400).json({
//           errCode: 1,
//           errMessage: "Missing orderId",
//         });
//       }

//       const payment = await db.ZaloPayPayment.findOne({
//         where: { orderId },
//       });

//       if (!payment) {
//         return res.status(404).json({
//           errCode: 2,
//           errMessage: "Không tìm thấy giao dịch",
//         });
//       }

//       return res.status(200).json({
//         errCode: 0,
//         status: payment.status, // SUCCESS | FAILED | PENDING
//         data: payment,
//       });
//     } catch (e) {
//       console.log("Lỗi kiểm tra trạng thái:", e);
//       return res.status(500).json({
//         errCode: -1,
//         errMessage: "Lỗi server",
//       });
//     }
//   }
// }

// module.exports = new OrderController();

//---------------------------------------------------
const orderService = require("../services/orderService");

class OrderController {
  async createOrder(req, res) {
    try {
      const { items, description, amount } = req.body;
      if (!items || !amount) {
        return res
          .status(400)
          .json({ errCode: 1, errMessage: "Missing items or amount" });
      }

      const result = await orderService.createOrder(req.body);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi tạo order ZaloPay:", error.response?.data || error);
      return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
  }

  async getPaymentStatus(req, res) {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res
          .status(400)
          .json({ errCode: 1, errMessage: "Missing orderId" });
      }

      const result = await orderService.getPaymentStatus(orderId);
      if (!result.success) {
        return res.status(404).json({ errCode: 2, errMessage: result.message });
      }

      return res
        .status(200)
        .json({ errCode: 0, status: result.status, data: result.data });
    } catch (e) {
      return res.status(500).json({ errCode: -1, errMessage: e.message });
    }
  }

  // Fake callback để test frontend hiển thị PAID
  async fakeCallback(req, res) {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing orderId" });
      }

      const result = await orderService.handleFakeCallback(orderId);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new OrderController();
