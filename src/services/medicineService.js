import db from "../models/index";
import { Op } from "sequelize";

let getMedicinesService = async (search) => {
  try {
    let whereCondition = {};

    // Nếu có tham số search thì lọc theo ký tự đầu
    if (search) {
      whereCondition = {
        [Op.or]: [
          { "$allcodeData.valueVI$": { [Op.like]: `%${search}%` } },
          { "$allcodeData.valueEN$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    let medicines = await db.Medicine.findAll({
      where: whereCondition,
      include: [
        {
          model: db.Allcode,
          as: "allcodeData",
          attributes: ["id", "keyMap", "valueVI", "valueEN"],
        },
      ],
      order: [["id", "DESC"]],
      raw: false,
      nest: true,
    });

    return {
      errCode: 0,
      errMessage: "OK",
      data: medicines,
    };
  } catch (e) {
    console.log(e);
    return { errCode: -1, errMessage: "Error from server" };
  }
};

module.exports = {
  getMedicinesService,
};
