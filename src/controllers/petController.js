import petService from "../services/petService";
const multer = require("multer");
const upload = multer();

let handleCreatePet = async (req, res) => {
  let message = await petService.createNewPet(req.body);
  return res.status(200).json(message);
};

let handleUpdatePet = (req, res) => {
  upload.single("image")(req, res, async (err) => {
    try {
      if (err) {
        console.log("Multer error:", err);
        return res.status(400).json({ errCode: 1, message: "Upload error" });
      }

      let data = req.body;

      // Nếu có file
      if (req.file) {
        data.image = req.file.buffer; // buffer chuẩn
      }

      let result = await petService.updatePetData(data);

      return res.status(200).json(result);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        errCode: -1,
        message: "Error from server",
      });
    }
  });
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
  try {
    let petId = req.query.petId;
    let response = await petService.getPetDetail(petId);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Server error",
    });
  }
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

let getPetsByUser = async (req, res) => {
  let ownerId = req.query.ownerId;

  let result = await petService.getPetsByUser(ownerId);

  return res.status(200).json(result);
};

let getPrescribedPets = async (req, res) => {
  try {
    const result = await petService.getPrescribedPetsService();
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ errCode: -1, message: "Error from server" });
  }
};

module.exports = {
  handleCreatePet,
  handleUpdatePet,
  handleDeletePet,
  handleGetPetsByUser,
  handleGetPetDetail,
  handleGetAllCodes,
  getPetsByUser,
  getPrescribedPets,
};
