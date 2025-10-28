import db from "../models/index";

let createHandbook = (data) => {
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
        await db.Handbook.create({
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

let getAllHandbook = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Handbook.findAll({
        attributes: ["id", "name", "image", "descriptionHTML"],
      });
      if (data && data.length > 0) {
        data = data.map((item) => {
          item.image = item.image
            ? Buffer.from(item.image, "base64").toString("binary")
            : "";
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

let getDetailHandbookById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        let data = await db.Handbook.findOne({
          where: { id: inputId },
          attributes: [
            "name",
            "image",
            "descriptionHTML",
            "descriptionMarkdown",
          ],
        });
        if (data) {
          data.image = data.image ? data.image.toString("base64") : "";
        } else {
          data = {};
        }
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

module.exports = {
  createHandbook: createHandbook,
  getAllHandbook: getAllHandbook,
  getDetailHandbookById: getDetailHandbookById,
};
