import aiService from "../services/aiService.js";

const handleAskAI = async (req, res) => {
  try {
    const { question } = req.body;

    // Kiểm tra input
    if (!question || question.trim() === "") {
      return res.status(400).json({
        errCode: 1,
        message: "Thiếu nội dung câu hỏi.",
      });
    }

    // Gọi service xử lý logic AI
    const response = await aiService.handleAskAI(question);

    return res.status(200).json({
      errCode: 0,
      message: "OK",
      data: response,
    });
  } catch (error) {
    console.error("❌ Lỗi tại AI Controller:", error);
    return res.status(500).json({
      errCode: -1,
      message: "Lỗi server nội bộ khi xử lý câu hỏi AI.",
      error: error.message,
    });
  }
};

export default {
  handleAskAI,
};
