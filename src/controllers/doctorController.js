import doctorService from "../services/doctorService";

let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 10;
  try {
    let response = await doctorService.getTopDoctorHome(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server...",
    });
  }
};

let getAllDoctors = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctors();
    return res.status(200).json(doctors);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let postInforDoctor = async (req, res) => {
  try {
    let response = await doctorService.saveDetailInforDoctor(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log("tien check loi: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getDetailDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getDetailDoctorById(req.query.id);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let bulkCreateSchedule = async (req, res) => {
  try {
    let infor = await doctorService.bulkCreateSchedule(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.error("Lỗi trong bulkCreateSchedule controller:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getScheduleByDate = async (req, res) => {
  try {
    let infor = await doctorService.getScheduleByDate(
      req.query.doctorID,
      req.query.date
    );
    return res.status(200).json(infor);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getExtraInforDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getExtraInforDoctorById(req.query.doctorID);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getProfileDoctorById = async (req, res) => {
  try {
    let infor = await doctorService.getProfileDoctorById(req.query.doctorID);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getListNewBookingForDoctor = async (req, res) => {
  try {
    let infor = await doctorService.getListNewBookingForDoctor(
      req.query.doctorID,
      req.query.date
    );
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getListPatientForDoctor = async (req, res) => {
  try {
    let infor = await doctorService.getListPatientForDoctor(
      req.query.doctorID,
      req.query.date
    );
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let approveBooking = async (req, res) => {
  try {
    let result = await doctorService.approveBooking(req.body);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let rejectBooking = async (req, res) => {
  try {
    let result = await doctorService.rejectBooking(req.body);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let sendRemedy = async (req, res) => {
  try {
    let infor = await doctorService.sendRemedy(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the sever",
    });
  }
};

let getPendingDoctors = async (req, res) => {
  try {
    let data = await doctorService.getPendingDoctors();
    return res.status(200).json(data);
  } catch (e) {
    console.log("getPendingDoctors error: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let approveDoctor = async (req, res) => {
  try {
    let doctorId = req.body.doctorId; // đảm bảo có ID
    if (!doctorId) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing doctorId in request body",
      });
    }

    let data = await doctorService.approveDoctor(doctorId);
    return res.status(200).json(data);
  } catch (e) {
    console.log("approveDoctor error: ", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let rejectDoctor = async (req, res) => {
  try {
    let data = await doctorService.rejectDoctor(req.body.doctorId);
    return res.status(200).json(data);
  } catch (e) {
    console.log("rejectDoctor error: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let handleSendInterviewEmail = async (req, res) => {
  try {
    let response = await doctorService.sendInterviewEmail(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ errCode: -1, errMessage: "Server error" });
  }
};

let getApprovedDoctorsList = async (req, res) => {
  try {
    let data = await doctorService.getApprovedDoctorsList();
    return res.status(200).json(data);
  } catch (e) {
    console.log("getApprovedDoctors error: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let activateDoctor = async (req, res) => {
  try {
    let data = await doctorService.activateDoctor(req.body.doctorId);
    return res.status(200).json(data);
  } catch (e) {
    console.log("activateDoctor error: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getDoctorById = async (req, res) => {
  try {
    let doctorId = req.query.doctorId; // lấy từ query như thói quen backend hiện tại
    let infor = await doctorService.getDoctorByIdService(doctorId);
    return res.status(200).json(infor);
  } catch (e) {
    console.error(" Error from getDoctorById:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  postInforDoctor: postInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getApprovedDoctorsList,
  activateDoctor,
  handleSendInterviewEmail,
  getDoctorById,
  approveBooking,
  getListNewBookingForDoctor,
  rejectBooking,
};
