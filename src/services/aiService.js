import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../models/index.js";
const fetch = require("node-fetch");
globalThis.fetch = fetch;

// Một số SDK cần thêm Headers, Request, Response
if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleAskAI = async (question) => {
  try {
    const lowerQ = question.toLowerCase();

    // 1️⃣ Kiểm tra xem có nhắc tới "bác sĩ", "chuyên khoa", hay "thú y"
    const isSpecialtyQuestion =
      lowerQ.includes("bác sĩ") ||
      lowerQ.includes("chuyên khoa") ||
      lowerQ.includes("khám") ||
      lowerQ.includes("thú y");

    let dataForAI = "";
    let extraContext = "";

    if (isSpecialtyQuestion) {
      const allSpecialtiesRaw = await db.Specialty.findAll({
        attributes: ["id", "name"],
      });
      const allSpecialties = allSpecialtiesRaw.map((s) =>
        s.get ? s.get({ plain: true }) : s
      );

      let matchedSpecialty = null;
      for (const s of allSpecialties) {
        if (lowerQ.includes(s.name.toLowerCase())) {
          matchedSpecialty = s;
          break;
        }
      }

      if (matchedSpecialty) {
        const doctorInfosRaw = await db.Doctor_Infor.findAll({
          where: { specialtyID: matchedSpecialty.id },
          include: [
            {
              model: db.User,
              attributes: [
                "firstName",
                "lastName",
                "phoneNumber",
                "address",
                "gender",
              ],
            },
          ],
          raw: true, // ✅ ép trả về plain object để tránh lỗi .get
          nest: true,
        });

        if (doctorInfosRaw && doctorInfosRaw.length > 0) {
          dataForAI = doctorInfosRaw
            .map(
              (d) =>
                `- Bác sĩ ${d.User?.lastName ?? ""} ${
                  d.User?.firstName ?? ""
                }, giới tính: ${d.User?.gender === "M" ? "Nam" : "Nữ"}, SĐT: ${
                  d.User?.phoneNumber ?? "Không có"
                }, địa chỉ: ${d.User?.address ?? "Không rõ"}`
            )
            .join("\n");

          extraContext = `Dưới đây là danh sách bác sĩ chuyên khoa "${matchedSpecialty.name}" trong hệ thống:\n${dataForAI}`;
        } else {
          extraContext = `Hiện chưa có bác sĩ nào thuộc chuyên khoa "${matchedSpecialty.name}".`;
        }
      } else {
        extraContext = `Không tìm thấy chuyên khoa nào khớp với câu hỏi.`;
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
    Bạn là một trợ lý AI chuyên về lĩnh vực thú y.
    ${extraContext ? `\n${extraContext}\n` : ""}
    Trả lời câu hỏi sau bằng tiếng Việt, ngắn gọn và dễ hiểu:
    "${question}"
    `;

    const result = await model.generateContent(prompt);

    // 5️⃣ Trả kết quả về controller
    return result.response.text();
  } catch (error) {
    console.error("❌ Lỗi tại AI Service:", error);
    return "Xin lỗi, tôi đang gặp sự cố khi trả lời câu hỏi.";
  }
};

export default {
  handleAskAI,
};
