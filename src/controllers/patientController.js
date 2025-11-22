import patientService from "../services/patientService";

let postBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let postVerifyBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postVerifyBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getBookingHistory = async (req, res) => {
  try {
    let infor = await patientService.getBookingHistory(req.body.email);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};

let getBookingStatusByEmail = async (req, res) => {
  try {
    let email = req.body.email;
    let result = await patientService.getBookingStatusByEmail(email);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};

let cancelBooking = async (req, res) => {
  try {
    let bookingId = req.body.bookingId;
    let result = await patientService.cancelBooking(bookingId);
    return res.status(200).json(result);
  } catch (e) {
    console.log("Error cancelBooking:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};

let rescheduleBooking = async (req, res) => {
  try {
    let result = await patientService.rescheduleBooking(req.body);
    return res.status(200).json(result);
  } catch (e) {
    console.log("Error rescheduleBooking:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};

let getBookingStatusS3 = async (req, res) => {
  try {
    let email = req.body.email;
    let result = await patientService.getBookingStatusS3(email);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};

module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getBookingHistory: getBookingHistory,
  getBookingStatusByEmail,
  cancelBooking,
  rescheduleBooking,
  getBookingStatusS3,
};
