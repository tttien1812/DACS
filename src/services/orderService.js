const axios = require("axios");
const dayjs = require("dayjs");
const zaloConfig = require("../config/zalopayConfig");

class OrderService {
  async createOrder({
    items,
    description,
    amount,
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

      // embed_data chứa thông tin KH + booking
      const embed_data = JSON.stringify({
        patientName,
        patientEmail,
        animal,
        doctorName,
        date,
        time,
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

      if (response.data.return_code === 1) {
        return response.data;
      } else {
        throw response.data;
      }
    } catch (err) {
      throw err;
    }
  }
}
module.exports = new OrderService();
