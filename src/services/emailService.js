require("dotenv").config();
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, //587 for false
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"FurCare" <Furcareee@gmail.com>',
    to: dataSend.reciverEmail,
    subject: "Xác nhận đặt lịch khám thú cưng từ FurCare",
    text: "FurCare - Xác nhận lịch khám", // plain-text body
    html: getBodyHTMLEmail(dataSend),
  });
};

let getBodyHTMLEmail = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>Xin chào ${dataSend.patientName},</h3>
      <p>FurCare xin xác nhận rằng bạn đã <strong>đặt lịch khám thành công</strong> cho thú cưng của mình.</p>
      
      <h4>📅 Thông tin lịch hẹn:</h4>
      <ul>
        <li><strong>Bác sĩ:</strong> ${dataSend.doctorName}</li>
        <li><strong>Thú cưng:</strong> ${dataSend.petName}</li>
        <li><strong>Thời gian:</strong> ${dataSend.time}</li>
      </ul>

      <p>✅ Vui lòng có mặt đúng giờ và mang theo sổ khám hoặc thông tin liên quan nếu có.</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        <p style="margin-top: 30px;">Trân trọng,<br/>
         Đội ngũ FurCare 🐾</p>
        </div>
      <hr/>
      <small>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</small>
    </div>
  `;
  }
  if (dataSend.language === "en") {
    result = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>Hello ${dataSend.patientName},</h3>

      <p>We’re happy to confirm your <strong>pet's appointment</strong> has been successfully scheduled via <strong>FurCare</strong>.</p>

      <h4>📅 Appointment Details:</h4>
      <ul>
      <li><strong>Doctor:</strong> ${dataSend.doctorName}</li>
      <li><strong>Pet Name:</strong> ${dataSend.petName}</li>
        <li><strong>Time:</strong> ${dataSend.time}</li>
      </ul>

      <p>✅ Please make sure to arrive on time and bring any relevant medical history or documents if available.</p>

      <p>If you need to modify or cancel your appointment, feel free to contact us via email or hotline.</p>

      <div>
      <a href=${dataSend.redirectLink} target="_blank">Click here</a>
      <p style="margin-top: 30px;">Best regards,<br/>
      The FurCare Team 🐾</p>
        </div>

      <hr/>
      <small>This is an automated message. Please do not reply to this email.</small>
    </div>
  `;
  }

  return result;
};

let getBodyHTMLEmailRemedy = (dataSend) => {
  let result = "";

  if (dataSend.language === "vi") {
    result = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>Xin chào ${dataSend.patientName},</h3>

      <p>✅ FurCare xác nhận rằng bạn đã <strong>thanh toán thành công hóa đơn khám bệnh</strong> cho thú cưng của mình.</p>

      <p>🧾 Thông tin chi tiết hóa đơn đã được gửi kèm dưới dạng <strong>hình ảnh đính kèm</strong> trong email này.</p>

      <p style="margin-top: 30px;">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của FurCare.<br/>
      Trân trọng,<br/>
      Đội ngũ FurCare 🐾</p>

      <hr/>
      <small>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</small>
    </div>
  `;
  }

  if (dataSend.language === "en") {
    result = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>Hello ${dataSend.patientName},</h3>

      <p>✅ FurCare confirms that your <strong>payment for the veterinary invoice</strong> has been successfully received.</p>

      <p>🧾 The full invoice details are included as a <strong>picture attachment</strong> with this email.</p>

      <p style="margin-top: 30px;">Thank you for trusting FurCare.<br/>
      Best regards,<br/>
      The FurCare Team 🐾</p>

      <hr/>
      <small>This is an automated message. Please do not reply to this email.</small>
    </div>
  `;
  }

  return result;
};

let sendAttachment = async (dataSend) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, //587 for false
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      let info = await transporter.sendMail({
        from: '"FurCare" <Furcare@gmail.com>',
        to: dataSend.email,
        subject: "Hóa đơn khám bệnh từ FurCare",
        text: "FurCare - Hóa đơn khám bệnh", // plain-text body
        html: getBodyHTMLEmailRemedy(dataSend),
        attachments: [
          {
            filename: `remedy-${
              dataSend.patientID
            }-${new Date().getTime()}.png`,
            content: dataSend.imgBase64.split("base64,")[1],
            encoding: "base64",
          },
        ],
      });

      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  sendSimpleEmail: sendSimpleEmail,
  sendAttachment: sendAttachment,
};
