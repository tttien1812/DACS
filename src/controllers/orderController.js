const orderService = require("../services/orderService");

class OrderController {
  async createOrder(req, res) {
    try {
      const { items, description, amount } = req.body;

      if (!items || !amount) {
        return res.status(400).json({
          errCode: 1,
          errMessage: "Missing items or amount",
        });
      }

      const result = await orderService.createOrder({
        items,
        description,
        amount,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi tạo order ZaloPay:", error.response?.data || error);
      return res.status(500).json({
        errCode: -1,
        errMessage: "Server error",
        details: errerror.response?.data || error.message || erroror,
      });
    }
  }
}

module.exports = new OrderController();
