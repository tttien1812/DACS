import medicineService from "../services/medicineService";

let getMedicines = async (req, res) => {
  let search = req.query.search || null;
  let response = await medicineService.getMedicinesService(search);
  return res.status(200).json(response);
};

module.exports = {
  getMedicines,
};
