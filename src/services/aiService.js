// import { GoogleGenerativeAI } from "@google/generative-ai";
// import db from "../models/index.js";
// const fetch = require("node-fetch");
// globalThis.fetch = fetch;

// // Một số SDK cần thêm Headers, Request, Response
// if (typeof globalThis.Headers === "undefined") {
//   globalThis.Headers = fetch.Headers;
//   globalThis.Request = fetch.Request;
//   globalThis.Response = fetch.Response;
// }

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // =========================
// //  THÊM QUEUE + DELAY
// // =========================
// let lastCallTime = 0;

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// async function throttleRequest() {
//   const now = Date.now();
//   const diff = now - lastCallTime;

//   // Đảm bảo mỗi request cách nhau tối thiểu 250ms
//   if (diff < 250) {
//     await delay(250 - diff);
//   }

//   lastCallTime = Date.now();
// }
// // =========================

// const handleAskAI = async (question) => {
//   try {
//     await throttleRequest();

//     const lowerQ = question.toLowerCase();

//     // 1️⃣ Kiểm tra xem có nhắc tới "bác sĩ", "chuyên khoa", hay "thú y"
//     const isSpecialtyQuestion =
//       lowerQ.includes("bác sĩ") ||
//       lowerQ.includes("chuyên khoa") ||
//       lowerQ.includes("khám") ||
//       lowerQ.includes("thú y");

//     let dataForAI = "";
//     let extraContext = "";

//     if (isSpecialtyQuestion) {
//       const allSpecialtiesRaw = await db.Specialty.findAll({
//         attributes: ["id", "name"],
//       });
//       const allSpecialties = allSpecialtiesRaw.map((s) =>
//         s.get ? s.get({ plain: true }) : s
//       );

//       let matchedSpecialty = null;
//       for (const s of allSpecialties) {
//         if (lowerQ.includes(s.name.toLowerCase())) {
//           matchedSpecialty = s;
//           break;
//         }
//       }

//       if (matchedSpecialty) {
//         const doctorInfosRaw = await db.Doctor_Infor.findAll({
//           where: { specialtyID: matchedSpecialty.id },
//           include: [
//             {
//               model: db.User,
//               attributes: [
//                 "firstName",
//                 "lastName",
//                 "phoneNumber",
//                 "address",
//                 "gender",
//               ],
//             },
//           ],
//           raw: true, // ✅ ép trả về plain object để tránh lỗi .get
//           nest: true,
//         });

//         if (doctorInfosRaw && doctorInfosRaw.length > 0) {
//           // Giảm số lượng doctor để tiết kiệm token (không thay đổi logic)
//           const doctorList = doctorInfosRaw.slice(0, 6);
//           dataForAI = doctorInfosRaw
//             .map(
//               (d) =>
//                 `- Bác sĩ ${d.User?.lastName ?? ""} ${
//                   d.User?.firstName ?? ""
//                 }, giới tính: ${d.User?.gender === "M" ? "Nam" : "Nữ"}, SĐT: ${
//                   d.User?.phoneNumber ?? "Không có"
//                 }, địa chỉ: ${d.User?.address ?? "Không rõ"}`
//             )
//             .join("\n");

//           extraContext = `Dưới đây là danh sách bác sĩ chuyên khoa "${matchedSpecialty.name}" trong hệ thống:\n${dataForAI}`;
//         } else {
//           extraContext = `Hiện chưa có bác sĩ nào thuộc chuyên khoa "${matchedSpecialty.name}".`;
//         }
//       } else {
//         extraContext = `Không tìm thấy chuyên khoa nào khớp với câu hỏi.`;
//       }
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//     const prompt = `
//     Bạn là một trợ lý AI chuyên về lĩnh vực thú y.
//     ${extraContext ? `\n${extraContext}\n` : ""}
//     Trả lời câu hỏi sau bằng tiếng Việt, ngắn gọn và dễ hiểu:
//     "${question}"
//     `;

//     const result = await model.generateContent(prompt);

//     // 5️⃣ Trả kết quả về controller
//     console.log("Gemini response:", result);
//     return result.response.text();
//   } catch (error) {
//     console.error("❌ Lỗi tại AI Service:", error);
//     return "Xin lỗi, tôi đang gặp sự cố khi trả lời câu hỏi.";
//   }
// };

// export default {
//   handleAskAI,
// };

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import db from "../models/index.js";
// const fetch = require("node-fetch");
// globalThis.fetch = fetch;

// // Một số SDK cần thêm Headers, Request, Response
// if (typeof globalThis.Headers === "undefined") {
//   globalThis.Headers = fetch.Headers;
//   globalThis.Request = fetch.Request;
//   globalThis.Response = fetch.Response;
// }

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // =========================
// //  CACHE — giảm request AI
// // =========================
// const aiCache = new Map();
// const CACHE_TTL = 60000; // 60 giây

// function getCache(question) {
//   const item = aiCache.get(question);
//   if (!item) return null;

//   if (Date.now() - item.time < CACHE_TTL) {
//     return item.data;
//   }

//   aiCache.delete(question);
//   return null;
// }

// function setCache(question, data) {
//   aiCache.set(question, { data, time: Date.now() });
// }

// // =========================
// //    THROTTLE — 250ms
// // =========================
// let lastCallTime = 0;

// const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// async function throttle() {
//   const now = Date.now();
//   const diff = now - lastCallTime;

//   if (diff < 250) {
//     await wait(250 - diff);
//   }

//   lastCallTime = Date.now();
// }

// // =========================
// //      MAIN FUNCTION
// // =========================
// const handleAskAI = async (question) => {
//   try {
//     const cleanQ = question.trim().toLowerCase();

//     // 1️⃣ CACHE CHECK — giảm request AI tối đa
//     const cached = getCache(cleanQ);
//     if (cached) return cached;

//     await throttle();

//     let extraContext = "";

//     const isSpecialtyQuestion =
//       cleanQ.includes("bác sĩ") ||
//       cleanQ.includes("chuyên khoa") ||
//       cleanQ.includes("khám") ||
//       cleanQ.includes("thú y");

//     if (isSpecialtyQuestion) {
//       const specialtiesRaw = await db.Specialty.findAll({
//         attributes: ["id", "name"],
//       });

//       const specialties = specialtiesRaw.map((s) =>
//         s.get ? s.get({ plain: true }) : s
//       );

//       let match = null;
//       for (const s of specialties) {
//         if (cleanQ.includes(s.name.toLowerCase())) {
//           match = s;
//           break;
//         }
//       }

//       if (match) {
//         const doctorInfos = await db.Doctor_Infor.findAll({
//           where: { specialtyID: match.id },
//           include: [
//             {
//               model: db.User,
//               attributes: [
//                 "firstName",
//                 "lastName",
//                 "phoneNumber",
//                 "address",
//                 "gender",
//               ],
//             },
//           ],
//           raw: true,
//           nest: true,
//           limit: 5, // 🟢 giảm tải database
//         });

//         if (doctorInfos.length > 0) {
//           const list = doctorInfos
//             .map(
//               (d) =>
//                 `- Bác sĩ ${d.User?.lastName ?? ""} ${
//                   d.User?.firstName ?? ""
//                 } | Giới tính: ${
//                   d.User?.gender === "M" ? "Nam" : "Nữ"
//                 } | SĐT: ${d.User?.phoneNumber ?? "Không có"} | Địa chỉ: ${
//                   d.User?.address ?? "Không rõ"
//                 }`
//             )
//             .join("\n");

//           extraContext = `Danh sách bác sĩ chuyên khoa "${match.name}":\n${list}`;
//         } else {
//           extraContext = `Chưa có bác sĩ nào thuộc chuyên khoa "${match.name}".`;
//         }
//       } else {
//         extraContext = "Không tìm thấy chuyên khoa liên quan trong hệ thống.";
//       }
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = `
// Bạn là trợ lý AI cho phòng khám thú cưng.
// ${extraContext ? extraContext + "\n" : ""}
// Hãy trả lời ngắn gọn, rõ ràng bằng tiếng Việt:
// "${question}"`;

//     const result = await model.generateContent(prompt);
//     const finalText = result.response.text();

//     // 2️⃣ LƯU CACHE
//     setCache(cleanQ, finalText);

//     return finalText;
//   } catch (err) {
//     console.error("❌ Lỗi tại AI Service:", err);
//     return "Xin lỗi, tôi đang gặp sự cố khi trả lời câu hỏi.";
//   }
// };

// export default {
//   handleAskAI,
// };

//----------------------------------------------------------------------------

// import db from "../models/index.js";
// import axios from "axios";

// // ======================
// // CACHE — 60s
// // ======================
// const aiCache = new Map();
// const CACHE_TTL = 60000;

// function getCache(key) {
//   const c = aiCache.get(key);
//   if (!c) return null;
//   if (Date.now() - c.time < CACHE_TTL) return c.data;
//   aiCache.delete(key);
//   return null;
// }

// function setCache(key, data) {
//   aiCache.set(key, { data, time: Date.now() });
// }

// // ======================
// // THROTTLE — 250ms
// // ======================
// let lastCall = 0;
// const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// async function throttle() {
//   const now = Date.now();
//   const diff = now - lastCall;
//   if (diff < 250) await wait(250 - diff);
//   lastCall = Date.now();
// }

// // ======================
// // TIMEOUT WRAPPER — 10s
// // ======================
// function withTimeout(promise, ms = 10000) {
//   return Promise.race([
//     promise,
//     new Promise((_, reject) =>
//       setTimeout(() => reject(new Error("TIMEOUT")), ms)
//     ),
//   ]);
// }

// // ==================================================================
// //                           MAIN FUNCTION
// // ==================================================================

// const handleAskAI = async (question) => {
//   try {
//     const cleanQ = question.trim();

//     // 1) CACHE CHECK
//     const cached = getCache(cleanQ);
//     if (cached) return cached;

//     await throttle();

//     // 2) Phân loại câu hỏi liên quan bác sĩ/chuyên khoa
//     const keywords = ["bác sĩ", "chuyên khoa", "khám", "thú y"];
//     const isDoctorQuestion = keywords.some((kw) =>
//       cleanQ.toLowerCase().includes(kw)
//     );

//     let extraContext = "";

//     if (isDoctorQuestion) {
//       const specialties = await db.Specialty.findAll({
//         attributes: ["id", "name"],
//         raw: true,
//       });

//       let match = specialties.find((s) =>
//         cleanQ.toLowerCase().includes(s.name.toLowerCase())
//       );

//       if (match) {
//         const doctors = await db.Doctor_Infor.findAll({
//           where: { specialtyID: match.id },
//           include: [
//             {
//               model: db.User,
//               attributes: [
//                 "firstName",
//                 "lastName",
//                 "phoneNumber",
//                 "address",
//                 "gender",
//               ],
//             },
//           ],
//           raw: true,
//           nest: true,
//           limit: 5,
//         });

//         if (doctors.length > 0) {
//           extraContext =
//             `Danh sách bác sĩ thuộc chuyên khoa "${match.name}":\n` +
//             doctors
//               .map(
//                 (d) =>
//                   `- Bác sĩ ${d.User.lastName} ${d.User.firstName} | ` +
//                   `Giới tính: ${d.User.gender === "M" ? "Nam" : "Nữ"} | ` +
//                   `SĐT: ${d.User.phoneNumber ?? "Không có"} | ` +
//                   `Địa chỉ: ${d.User.address ?? "Không rõ"}`
//               )
//               .join("\n");
//         } else {
//           extraContext = `Không có bác sĩ nào thuộc chuyên khoa "${match.name}".`;
//         }
//       }
//     }

//     // 3) Prompt tối ưu cho model 1B (ngắn – hiệu quả)
//     // const prompt = extraContext
//     //   ? `Bạn là trợ lý AI thú y.\n${extraContext}\nCâu hỏi: "${cleanQ}"\nTrả lời ngắn gọn bằng tiếng Việt.`
//     //   : `Bạn là trợ lý AI. Trả lời thật ngắn gọn bằng tiếng Việt:\n"${cleanQ}"`;

//     const prompt = extraContext
//       ? `Bạn là trợ lý AI hệ thống quản lý phòng khám thú y.
// Nhiệm vụ của bạn: trả lời câu hỏi dựa trên dữ liệu có sẵn, không đưa lời khuyên y tế hay lời từ chối trách nhiệm.
// Nếu người dùng hỏi về bác sĩ, hãy trả lời bằng danh sách bác sĩ phù hợp trong dữ liệu sau:

// ${extraContext}

// Câu hỏi: "${cleanQ}"

// Trả lời trực tiếp bằng tiếng Việt, không từ chối, không cảnh báo chung, không đưa ra lời khuyên điều trị.`
//       : `Bạn là trợ lý AI hệ thống. Trả lời ngắn gọn bằng tiếng Việt:\n"${cleanQ}"`;

//     // 4) Gọi Ollama
//     const response = await withTimeout(
//       axios.post("http://localhost:11434/api/generate", {
//         model: "llama3.2:1b",
//         prompt: prompt,
//         stream: false,
//       }),
//       10000
//     );

//     console.log("Ollama response:", response.data);

//     const text = response.data?.response ?? "AI không trả lời.";

//     // 5) Lưu cache
//     setCache(cleanQ, text);

//     return text;
//   } catch (err) {
//     console.error("AI ERROR:", err.message);

//     if (err.message === "TIMEOUT") {
//       return "AI phản hồi chậm, vui lòng thử lại.";
//     }

//     return "Xin lỗi, hệ thống AI hiện đang gặp sự cố.";
//   }
// };

// export default {
//   handleAskAI,
// };

//----------------------------------------------------------------------------
import db from "../models/index.js";
import axios from "axios";
import moment from "moment";
import { symptomMapping } from "../utils/symptomMap.js";
import { triageRules } from "../utils/triageRules.js";

require("dotenv").config();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function smartMatchSpecialty(question, specialties, autoSpecialty) {
  const q = normalize(question);

  // 1. Match exact
  let match = specialties.find((s) => normalize(s.name) === q);
  if (match) return match;

  // 2. Match contains tên chuyên khoa
  match = specialties.find((s) => q.includes(normalize(s.name)));
  if (match) return match;

  // 3. Match từ symptomMapping → chuyên khoa tự động
  if (autoSpecialty) {
    const auto = normalize(autoSpecialty);
    match = specialties.find((s) => normalize(s.name).includes(auto));
    if (match) return match;
  }

  return null;
}

function detectMedicine(question, medicines) {
  if (!question || !medicines?.length) return null;

  const q = question.toLowerCase();

  return medicines.find((m) => {
    if (!m.description) return false;

    const desc = m.description.toLowerCase();

    // Match full description
    if (q.includes(desc)) return true;

    // Match keyword (lọc từ dài để tránh nhiễu)
    const keywords = desc.split(" ").filter((k) => k.length >= 5);
    return keywords.some((k) => q.includes(k));
  });
}

function detectTriageLevel(question) {
  const qRaw = question.toLowerCase();
  const qNorm = normalize(question);

  const match = (keyword) =>
    qRaw.includes(keyword.toLowerCase()) || qNorm.includes(normalize(keyword));

  if (triageRules.red.some(match)) {
    return {
      level: "🔴 CẤP CỨU",
      system: true,
      advice: [
        "Đưa thú cưng đến cơ sở thú y gần nhất NGAY LẬP TỨC",
        "Không tự ý điều trị tại nhà",
        "Giữ thú cưng ấm và hạn chế di chuyển",
      ],
    };
  }

  if (triageRules.yellow.some(match)) {
    return {
      level: "🟡 NÊN ĐI KHÁM SỚM",
      system: false,
      advice: [
        "Theo dõi sát tình trạng trong 24 giờ",
        "Nếu không cải thiện → nên đưa đi khám",
        "Ghi lại các triệu chứng để báo bác sĩ",
      ],
    };
  }

  return {
    level: "🟢 THEO DÕI TẠI NHÀ",
    system: false,
    advice: [
      "Tiếp tục theo dõi ăn uống và sinh hoạt",
      "Giữ môi trường sạch sẽ, yên tĩnh",
      "Nếu xuất hiện triệu chứng nặng hơn → đi khám",
    ],
  };
}

function buildEmergencyPrompt(question, doctorsText) {
  return `
🚨🚨🚨 CẢNH BÁO KHẨN CẤP 🚨🚨🚨
MỨC ĐỘ: 🔴 CẤP CỨU

HÀNH ĐỘNG NGAY:
• Đưa thú cưng đến cơ sở thú y gần nhất NGAY LẬP TỨC
• KHÔNG chờ đợi hoặc tự điều trị tại nhà
• Giữ thú cưng ấm và hạn chế di chuyển

${doctorsText ? `BÁC SĨ CÓ THỂ LIÊN HỆ NGAY:\n${doctorsText}` : ""}

⚠ Tình trạng có thể đe dọa tính mạng nếu trì hoãn

Câu hỏi của chủ nuôi: "${question}"

QUY TẮC BẮT BUỘC:
- KHÔNG giải thích nguyên nhân
- KHÔNG viết đoạn văn
- KHÔNG dùng tiêu đề TƯ VẤN / LƯU Ý
- KHÔNG hỏi lịch đặt khám
- CHỈ dùng bullet
`;
}

function renderTriageHeader(triage) {
  return `
==============================
ĐÁNH GIÁ KHẨN CẤP (HỆ THỐNG)
MỨC ĐỘ: ${triage.level}

KHUYẾN NGHỊ:
${triage.advice.map((a) => `• ${a}`).join("\n")}
==============================

`;
}

const aiService = {
  handleAskAI: async (question, res) => {
    try {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      // res.write("🤖 Đang xử lý yêu cầu...\n\n");

      if (!question) return res.end("⚠ Vui lòng nhập câu hỏi.");

      const triage = detectTriageLevel(question);

      // ✅ BẮT BUỘC IN TRIAGE TRƯỚC – KHÔNG PHỤ THUỘC AI
      res.write(renderTriageHeader(triage));

      //------------------------------------------------------
      // 1. RAG lấy bác sĩ theo chuyên khoa trong DB
      //------------------------------------------------------

      let extraContext = "";
      let doctorFound = false;

      const specialties = await db.Specialty.findAll({ raw: true });
      const medicines = await db.Medicine.findAll({ raw: true });

      let autoSpecialty = null;
      const qNorm = question.toLowerCase();

      Object.keys(symptomMapping).some((key) => {
        if (question.toLowerCase().includes(key)) {
          autoSpecialty = symptomMapping[key];
          return true;
        }
      });

      let match = smartMatchSpecialty(question, specialties, autoSpecialty);

      if (autoSpecialty && !match) {
        extraContext += `🔎 Phát hiện triệu chứng liên quan đến chuyên khoa: ${autoSpecialty}\n`;
      }

      if (match) {
        const doctors = await db.Doctor_Infor.findAll({
          where: { specialtyID: match.id },
          include: [
            {
              model: db.User,
              as: "doctorInfo",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "phoneNumber",
                "address",
              ],
            },
          ],
          raw: true,
          nest: true,
        });

        if (doctors.length > 0) {
          doctorFound = true;
          extraContext = doctors
            .map((d, index) => {
              const url = `http://localhost:3000/detail-doctor/${d.doctorInfo.id}`;
              return (
                `#${index + 1} Bác sĩ: ${d.doctorInfo.lastName} ${
                  d.doctorInfo.firstName
                }\n` +
                `Địa chỉ: ${d.doctorInfo.address ?? "Không rõ"}\n` +
                `SĐT: ${d.doctorInfo.phoneNumber ?? "Chưa cập nhật"}\n` +
                `Link đặt khám: ${url}\n`
              );
            })
            .join("\n");
        } else {
          extraContext = `❗ Không có bác sĩ nào thuộc chuyên khoa ${match.name}.`;
        }
      }

      // 🔴 CẤP CỨU → OVERRIDE TOÀN BỘ
      if (triage.level === "🔴 CẤP CỨU") {
        let doctorsText = "";

        if (doctorFound) {
          doctorsText = extraContext
            .split("\n")
            .filter((line) => line.startsWith("#"))
            .map((line) => `• ${line.replace("#", "").trim()}`)
            .join("\n");
        }

        const emergencyPrompt = buildEmergencyPrompt(question, doctorsText);

        const response = await axios({
          method: "POST",
          url: "https://api.groq.com/openai/v1/chat/completions",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY_CUS}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
          data: {
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: emergencyPrompt }],
            stream: true,
          },
        });

        response.data.on("data", (chunk) => {
          const lines = chunk.toString().split("\n");
          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim();
              if (data === "[DONE]") return res.end();

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) res.write(content);
              } catch {}
            }
          });
        });

        return;
      }

      const medicineFound = detectMedicine(question, medicines);
      let medicineContext = "";

      if (medicineFound) {
        medicineContext = `
 THÔNG TIN THUỐC TRONG HỆ THỐNG:
- Mô tả: ${medicineFound.description}
- Giá tham khảo: ${medicineFound.price} VNĐ

Ghi chú:
- Hệ thống KHÔNG lưu liều lượng chi tiết
- Chỉ tư vấn cách dùng & theo dõi an toàn
`;
      }

      let prompt = "";

      if (doctorFound) {
        prompt = `
Bạn là AI tư vấn thú y cho khách hàng.
Bạn PHẢI trả lời dựa 100% trên dữ liệu bác sĩ bên dưới.
Nếu người dùng hỏi thêm gì ngoài phạm vi dữ liệu → lịch sự từ chối và gợi ý.

BẮT BUỘC TUÂN THỦ FORMAT SAU:
- Không chèn dòng trống
- Mỗi ý 1 dòng
- Trình bày rõ ràng, súc tích

--- BÁC SĨ PHÙ HỢP ---
${extraContext}
--------------------------------

Yêu cầu của khách: "${question}"

Quy tắc trả lời:
- Trình bày dạng bullet rõ ràng.
- KHÔNG tự tạo thêm bác sĩ, thông tin, số điện thoại hay địa chỉ ngoài danh sách.
- Nếu người dùng hỏi về điều không có trong dữ liệu → trả lời "Dữ liệu không có, vui lòng cung cấp chuyên khoa khác".
- Cuối câu luôn kèm: "Bạn có muốn xem lịch đặt khám không?"

FORMAT TRẢ LỜI:

👨‍⚕️ BÁC SĨ PHÙ HỢP
• Liệt kê theo danh sách trên

TƯ VẤN
• Trả lời đúng nội dung câu hỏi
• Nếu phát hiện triệu chứng → gợi ý bác sĩ phù hợp

 LƯU Ý
• Không tự tạo bác sĩ
• Không thêm số điện thoại, địa chỉ ngoài dữ liệu
• Nếu câu hỏi ngoài phạm vi → trả lời: "Dữ liệu không có, vui lòng cung cấp chuyên khoa khác"

KẾT THÚC
• Bạn có muốn xem lịch đặt khám không?

  `;
      } else if (medicineFound) {
        prompt = `
Bạn là AI tư vấn thú y chuyên nghiệp.
Chỉ sử dụng dữ liệu bên dưới và kiến thức thú y PHỔ THÔNG, AN TOÀN.

BẮT BUỘC TUÂN THỦ FORMAT SAU:
- Không dòng trống
- Mỗi bullet 1 ý
- Không văn giải thích dài
- Không dùng câu "Tôi không thấy thông tin trong hệ thống"

--- DỮ LIỆU THUỐC ---
${medicineContext}
-------------------

Câu hỏi khách hàng: "${question}"

Yêu cầu trả lời:
- Thuốc dùng để làm gì (ngắn gọn)
- Cách dùng an toàn (KHÔNG nêu liều mg/kg)
- Những dấu hiệu cần theo dõi sau khi dùng
- Khi nào cần ngưng thuốc và đưa thú cưng đi bác sĩ
- Nếu là thuốc kê đơn → nhấn mạnh cần bác sĩ chỉ định

❌ KHÔNG:
- Không tự ý kê đơn
- Không cam kết chữa khỏi
- Không thay thế bác sĩ thú y

FORMAT TRẢ LỜI:

THÔNG TIN THUỐC
• Giải thích ngắn gọn thuốc dùng để làm gì

CÁCH DÙNG AN TOÀN
• Hướng dẫn chung
• Không nêu liều mg/kg
• Nhấn mạnh tuân theo bác sĩ/nhà sản xuất

THEO DÕI SAU KHI DÙNG
• Các dấu hiệu thường gặp
• Dấu hiệu bất thường cần chú ý

 KHI NÀO CẦN ĐI BÁC SĨ
• Các tình huống cần ngưng thuốc
• Khuyến nghị đưa thú cưng đi khám

 LƯU Ý
• Không tự ý kê đơn
• Không cam kết chữa khỏi
• Không thay thế bác sĩ thú y

Trả lời bằng bullet, tiếng Việt dễ hiểu.
`;

        if (doctorFound) {
          prompt += `
📌 Nếu tình trạng không cải thiện hoặc có phản ứng bất thường,
hãy gợi ý liên hệ bác sĩ bên dưới:

${extraContext}
`;
        }
      } else {
        prompt = `
Bạn là trợ lý thú y thông minh.
Mục tiêu của bạn:
✔ Trả lời tự nhiên các câu xã giao (xin chào, phép tính,…)
✔ Nếu người dùng hỏi về bệnh/thú cưng → hướng dẫn sơ cứu an toàn từng bước
✔ Nếu câu hỏi muốn tìm bác sĩ nhưng không có chuyên khoa → yêu cầu cung cấp chuyên khoa
✔ Không bịa tên bác sĩ nếu không có dữ liệu


Ví dụ hướng dẫn sơ cứu mẫu:
- Giữ thú cưng cố định
- Cầm máu bằng gạc sạch
- Chườm lạnh 10-15 phút
- Đưa đến thú y sớm nhất

Câu hỏi khách hàng: "${question}"
Trả lời tiếng Việt tự nhiên, ngắn gọn, không dài dòng.
`;
      }

      //------------------------------------------------------
      // 3. GỌI GROQ STREAM SSE ĐÚNG CÁCH
      //------------------------------------------------------

      const response = await axios({
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY_CUS}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
        data: {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        },
      });

      response.data.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");

        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();

            if (data === "[DONE]") {
              // res.write("\n\n✔ Hoàn tất tư vấn.");
              return res.end();
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;

              if (content) res.write(content);
            } catch {}
          }
        });
      });
    } catch (err) {
      console.error("❌ AI ERROR:", err.message);
      res.write("\n⚠ Lỗi AI, vui lòng thử lại sau.");
      return res.end();
    }
  },

  handleScheduleBot: async (req, res) => {
    let headerSent = false;

    try {
      const { question, doctorId } = req.body;
      if (!question || !doctorId) {
        return res.status(400).send("❗ Thiếu doctorId hoặc question");
      }

      // Gửi header sớm để tránh lỗi stream
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      headerSent = true;

      // ------------------------------------------------------------
      // 1. NHẬN DIỆN CÂU HỎI — có liên quan tới lịch hay không?
      // ------------------------------------------------------------
      const scheduleKeywords = [
        "lịch",
        "khám",
        "đặt lịch",
        "appointment",
        "schedule",
        "ca khám",
        "bác sĩ",
      ];
      const isScheduleQuestion = scheduleKeywords.some((k) =>
        question.toLowerCase().includes(k)
      );

      const diagnosisKeywords = [
        "tình trạng",
        "triệu chứng",
        "ngứa",
        "rụng lông",
        "nôn",
        "tiêu chảy",
        "mẩn đỏ",
        "biểu hiện",
      ];

      const isDiagnosisQuestion = diagnosisKeywords.some((k) =>
        question.toLowerCase().includes(k)
      );

      if (isDiagnosisQuestion) {
        const prompt = `
Bạn là AI hỗ trợ bác sĩ thú y, chỉ có nhiệm vụ tổng hợp thông tin.

NHIỆM VỤ:
- KHÔNG chẩn đoán bệnh
- KHÔNG khẳng định nguyên nhân
- KHÔNG đưa ra hướng điều trị

BÁC SĨ MÔ TẢ TÌNH TRẠNG THÚ CƯNG NHƯ SAU:
"${question}"

YÊU CẦU TRẢ LỜI:
1. Tóm tắt ngắn gọn tình trạng hiện tại
2. Các khả năng phổ biến có thể liên quan (tối đa 3, dùng từ "có thể")
3. Ghi chú hỗ trợ cho bác sĩ theo dõi
4. Cảnh báo bắt buộc: "Chỉ mang tính hỗ trợ, không thay thế chẩn đoán của bác sĩ"

NGÔN NGỮ: Tiếng Việt, trung lập, chuyên nghiệp
  `;

        const ai = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.3,
          },
          { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
        );

        res.write(ai.data.choices[0].message.content);
        return res.end();
      }

      // Nếu câu hỏi KHÔNG liên quan lịch → gửi thẳng AI trả lời tự nhiên
      if (!isScheduleQuestion) {
        const ai = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "Bạn là chatbot hỗ trợ bệnh nhân, hãy trả lời thân thiện và tự nhiên.",
              },
              { role: "user", content: question },
            ],
            max_tokens: 200,
            temperature: 0.7,
          },
          { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
        );

        res.write(ai.data.choices[0].message.content);
        return res.end();
      }

      // ------------------------------------------------------------
      // 2. NẾU LÀ CÂU HỎI VỀ LỊCH — xử lý như logic trước
      // ------------------------------------------------------------

      let dateInput =
        question.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ||
        question.match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
        req.body.date;

      const momentDate = dateInput
        ? moment(dateInput, ["DD/MM/YYYY", "YYYY-MM-DD"])
        : moment();

      const timestampDay = moment(momentDate).startOf("day").valueOf();

      const bookings = await db.Booking.findAll({
        where: { doctorID: doctorId, date: timestampDay.toString() },
        include: [
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueVI"],
          },
          {
            model: db.User,
            as: "patientData",
            attributes: ["firstName", "lastName", "address", "gender"],
          },
          { model: db.Allcode, as: "statusData", attributes: ["valueVI"] },
        ],
        raw: true,
        nest: true,
      });

      const list = bookings.map(
        (b, i) =>
          `${i + 1}. ⏳ ${b.timeTypeDataPatient?.valueVI} | 👤${
            b.patientData?.firstName
          } | 🏠 ${b.patientData?.address} | ${b.statusData?.valueVI}`
      );

      res.write(`📋 Tìm thấy ${bookings.length} lịch – gửi AI...\n`);

      const prompt = `
Bạn là trợ lý y tế, trả lời đúng trọng tâm và dễ hiểu.
Nếu không có lịch thì trả lời: "Ngày ${momentDate.format(
        "DD/MM/YYYY"
      )} không có lịch khám nào."
Nếu có lịch thì tổng hợp bằng bullet friendly:

📅 Ngày ${momentDate.format("DD/MM/YYYY")} có ${list.length} lịch khám:

${list.join("\n")}

Tổng cộng: ${list.length}
    `;

      const ai = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.2,
        },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
      );

      res.write(ai.data.choices[0].message.content);
      return res.end();
    } catch (err) {
      console.log("❌ Lỗi:", err.message);
      if (!headerSent) return res.status(500).send("Server lỗi!");
      res.write("\n⚠ Có lỗi xảy ra.");
      return res.end();
    }
  },
};

export default aiService;
