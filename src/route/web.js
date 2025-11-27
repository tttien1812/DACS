import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController";
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController";
import handbookController from "../controllers/handbookController";
import aiController from "../controllers/aiController";
import orderController from "../controllers/orderController";
import petController from "../controllers/petController";
import medicineController from "../controllers/medicineController";
import invoiceController from "../controllers/invoiceController";

let router = express.Router();

// let initWebRoutes = (app) =>{
//     router.get("/",(req, res)=>{
//         return res.send('Hello world')
//     });
let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  router.post("/api/login", userController.handleLogin);
  router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.post("/api/create-new-user", userController.handleCreateNewUser);
  router.put("/api/edit-user", userController.handleEditUser);
  router.delete("/api/delete-user", userController.handleDeleteUser);
  router.get("/api/allcode", userController.getAllCode);

  router.get("/api/top-doctor-home", doctorController.getTopDoctorHome);
  router.get("/api/get-all-doctors", doctorController.getAllDoctors);
  router.post("/api/save-infor-doctors", doctorController.postInforDoctor);
  router.get(
    "/api/get-detail-doctor-by-id",
    doctorController.getDetailDoctorById
  );
  router.post("/api/bulk-create-schedule", doctorController.bulkCreateSchedule);
  router.get(
    "/api/get-schedule-doctor-by-date",
    doctorController.getScheduleByDate
  );
  router.get(
    "/api/get-extra-infor-doctor-by-id",
    doctorController.getExtraInforDoctorById
  );
  router.get(
    "/api/get-profile-doctor-by-id",
    doctorController.getProfileDoctorById
  );

  router.get(
    "/api/get-list-new-booking-for-doctor",
    doctorController.getListNewBookingForDoctor
  );

  router.post("/api/approve-booking", doctorController.approveBooking);

  router.post("/api/reject-booking", doctorController.rejectBooking);

  router.get(
    "/api/get-list-patient-for-doctor",
    doctorController.getListPatientForDoctor
  );
  router.post("/api/send-remedy", doctorController.sendRemedy);

  router.get("/api/get-pending-doctors", doctorController.getPendingDoctors);
  router.put("/api/activate-doctor", doctorController.activateDoctor);
  router.get(
    "/api/get-approved-doctors",
    doctorController.getApprovedDoctorsList
  );
  // router.get("/api/get-rejected-doctors", doctorController.getRejectedDoctors);

  router.post("/api/approve-doctor", doctorController.approveDoctor);
  router.post("/api/reject-doctor", doctorController.rejectDoctor);
  router.post(
    "/api/send-interview-email",
    doctorController.handleSendInterviewEmail
  );

  router.get("/api/get-doctor-by-id", doctorController.getDoctorById);

  router.post(
    "/api/patient-book-appointment",
    patientController.postBookAppointment
  );
  router.post(
    "/api/verify-book-appointment",
    patientController.postVerifyBookAppointment
  );

  router.post(
    "/api/get-booking-status",
    patientController.getBookingStatusByEmail
  );

  router.put("/api/cancel-booking", patientController.cancelBooking);

  router.put("/api/reschedule-booking", patientController.rescheduleBooking);

  router.post(
    "/api/get-booking-status-s3",
    patientController.getBookingStatusS3
  );
  router.post("/api/get-booking-history", patientController.getBookingHistory);

  router.post("/api/create-new-specialty", specialtyController.createSpecialty);
  router.get("/api/get-specialty", specialtyController.getAllSpecialty);
  router.get(
    "/api/get-detail-specialty-by-id",
    specialtyController.getDetailSpecialtyById
  );

  router.post("/api/create-new-clinic", clinicController.createClinic);
  router.get("/api/get-clinic", clinicController.getAllClinic);
  router.get(
    "/api/get-detail-clinic-by-id",
    clinicController.getDetailClinicById
  );

  //handbook
  router.post("/api/create-new-handbook", handbookController.createHandbook);
  router.get("/api/get-handbook", handbookController.getAllHandbook);
  router.get(
    "/api/get-detail-handbook-by-id",
    handbookController.getDetailHandbookById
  );

  //AI
  router.post("/api/ask", aiController.handleAskAI);

  router.post("/api/order", orderController.createOrder);

  // Pet Profile
  router.post("/api/create-pet", petController.handleCreatePet);
  router.put("/api/update-pet", petController.handleUpdatePet);
  router.delete("/api/delete-pet", petController.handleDeletePet);

  router.get("/api/get-pets-by-email", petController.handleGetPetsByUser);
  router.get("/api/get-pet-detail", petController.handleGetPetDetail);
  router.get("/api/allpetcode", petController.handleGetAllCodes);
  router.get("/api/get-pets-by-user", petController.getPetsByUser);

  //Medicine
  router.get("/api/medicines", medicineController.getMedicines);

  //invoice
  router.post("/api/invoice/create", invoiceController.createInvoice);

  return app.use("/", router);
};

module.exports = initWebRoutes;
