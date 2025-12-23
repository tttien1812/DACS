import db from "../models/index";

let createSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        await db.Specialty.create({
          name: data.name,
          image: data.imageBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });

        resolve({
          errCode: 0,
          errMessage: "OK!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllSpecialty = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Specialty.findAll({
        // attributes: { exclude: ["image"] },
      });
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = new Buffer(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: "OK",
        data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailSpecialtyById = (inputId, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: {
            id: inputId,
          },
          attributes: ["descriptionHTML", "descriptionMarkdown"],
        });
        if (data) {
          let doctorSpecialty = [];
          if (location === "ALL") {
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: { specialtyID: inputId },
              attributes: ["doctorID", "provinceID"],
            });
          } else {
            //find by location
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: { specialtyID: inputId, provinceID: location },
              attributes: ["doctorID", "provinceID"],
            });
          }
          data.doctorSpecialty = doctorSpecialty;
        } else data = {};

        resolve({
          errCode: 0,
          errMessage: "OK",
          data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getDoctorsBySpecialty = (specialtyID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!specialtyID) {
        return resolve({
          errCode: 1,
          errMessage: "Missing specialtyID",
          data: [],
        });
      }

      let doctors = await db.Doctor_Infor.findAll({
        where: { specialtyID: specialtyID },
        include: [
          {
            model: db.User,
            as: "doctorInfo",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
        raw: false,
        nest: true,
      });

      // Convert avatar (base64) → binary nếu cần
      // if (doctors && doctors.length > 0) {
      //   doctors.forEach((doc) => {
      //     if (doc.doctorInfo && doc.doctorInfo.image) {
      //       doc.doctorInfo.image = Buffer.from(
      //         doc.doctorInfo.image,
      //         "base64"
      //       ).toString("binary");
      //     }
      //   });
      // }

      return resolve({
        errCode: 0,
        errMessage: "OK",
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
  getDoctorsBySpecialty,
};
