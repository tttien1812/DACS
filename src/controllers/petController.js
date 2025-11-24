import petService from "../services/petService";

let handleCreatePet = async (req, res) => {
  let message = await petService.createNewPet(req.body);
  return res.status(200).json(message);
};

let handleUpdatePet = async (req, res) => {
  try {
    let message = await petService.updatePetData(req.body);
    return res.status(200).json(message);
  } catch (e) {
    console.error("Error updating pet:", e);
    return res.status(500).json({
      errCode: -1,
      message: "Error from server",
    });
  }
};

let handleDeletePet = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameter: id",
    });
  }

  let message = await petService.deletePet(req.body.id);
  return res.status(200).json(message);
};

let handleGetPetsByUser = async (req, res) => {
  let email = req.query.email;

  if (!email) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameter: email",
      data: [],
    });
  }

  let response = await petService.getPetsByEmail(email);
  return res.status(200).json(response);
};

let handleGetPetDetail = async (req, res) => {
  let id = req.query.id;

  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameter: id",
    });
  }

  let detail = await petService.getPetDetail(id);
  return res.status(200).json(detail);
};

let handleGetAllCodes = async (req, res) => {
  try {
    let type = req.query.type;

    let data = await petService.getAllCodes(type);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Server error",
    });
  }
};

module.exports = {
  handleCreatePet,
  handleUpdatePet,
  handleDeletePet,
  handleGetPetsByUser,
  handleGetPetDetail,
  handleGetAllCodes,
};
