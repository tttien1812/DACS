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

const aiService = {
  handleAskAI: async (question, res) => {
    try {
      // ------ Tạo Context RAG từ Database ------
      const keywords = ["bác sĩ", "chuyên khoa", "khám", "thú y"];
      const isDoctor = keywords.some((kw) =>
        question.toLowerCase().includes(kw)
      );
      let extraContext = "";

      if (isDoctor) {
        const specialties = await db.Specialty.findAll({
          attributes: ["id", "name"],
          raw: true,
        });

        const match = specialties.find((s) =>
          question.toLowerCase().includes(s.name.toLowerCase())
        );

        if (match) {
          const doctors = await db.Doctor_Infor.findAll({
            where: { specialtyID: match.id },
            include: [
              {
                model: db.User,
                as: "doctorInfo",
                attributes: [
                  "firstName",
                  "lastName",
                  "phoneNumber",
                  "address",
                  "gender",
                ],
              },
            ],
            raw: true,
            nest: true,
          });

          extraContext = doctors.length
            ? doctors
                .map(
                  (d) =>
                    `- BS ${d.doctorInfo.lastName} ${
                      d.doctorInfo.firstName}
                     | ${d.doctorInfo.phoneNumber ?? "N/A"} | ${
                      d.doctorInfo.address ?? "N/A"
                    }`
                )
                .join("\n")
            : `Không có bác sĩ nào cho chuyên khoa ${match.name}`;
        }
      }

      //       const prompt = extraContext
      //         ? `
      // Thông tin bác sĩ từ database:
      // ${extraContext}

      // Câu hỏi: ${question}
      // Trả lời tiếng Việt rõ ràng, ưu tiên thông tin trong DB.
      // `
      //         : `Câu hỏi: ${question}\nTrả lời ngắn gọn tiếng Việt.`;

      const prompt = extraContext
        ? `Bạn là AI tư vấn thông tin bác sĩ thú y.
Chỉ được sử dụng dữ liệu trong phần "Dữ liệu bác sĩ" bên dưới để trả lời.
Tuyệt đối không tự bịa thêm tên, số điện thoại hay thông tin ngoài dữ liệu.

Dữ liệu bác sĩ:
${extraContext}

Yêu cầu: "${question}"
Trả lời bằng danh sách gọn gàng, đúng thông tin có trong database.
Nếu dữ liệu không liên quan hoặc không tìm thấy thì hãy nói rõ: "Không có bác sĩ phù hợp trong hệ thống."`
        : `Bạn là AI trả lời ngắn gọn bằng tiếng Việt.
Trả lời câu hỏi: "${question}"
Nếu câu hỏi yêu cầu dữ liệu bác sĩ mà không có context thì yêu cầu người dùng cung cấp chuyên khoa.`;

      // ------ STREAM từ Ollama ------
      const response = await axios({
        url: "http://localhost:11434/api/generate",
        method: "POST",
        responseType: "stream",
        data: {
          model: "phi3:mini", // ⚡ mô hình phù hợp máy bạn
          prompt,
          stream: true,
        },
      });

      response.data.on("data", (chunk) => {
        try {
          const text = JSON.parse(chunk.toString()).response;
          if (text) res.write(text); // gửi từng đoạn về FE
        } catch {}
      });

      response.data.on("end", () => res.end());
    } catch (err) {
      console.log("❌ AI Service ERROR:", err.message);
      res.write("⚠ AI đang gặp sự cố, thử lại sau.");
      res.end();
    }
  },
};

export default aiService;
