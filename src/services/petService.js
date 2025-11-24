import db from "../models";

let createNewPet = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.name || !data.species) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields: name, species, ownerId",
        });
      }

      await db.Pet.create({
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthday: data.birthday,
        weight: data.weight,
        gender: data.gender,
        status: data.status || "active",
        ownerId: data.ownerId,
      });

      resolve({
        errCode: 0,
        errMessage: "Pet created successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let updatePetData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter: id",
        });
      }

      let pet = await db.Pet.findOne({
        where: { id: data.id },
        raw: false,
      });

      if (!pet) {
        resolve({
          errCode: 2,
          errMessage: "Pet not found",
        });
      } else {
        pet.name = data.name;
        pet.species = data.species;
        pet.breed = data.breed;
        pet.birthday = data.birthday;
        pet.weight = data.weight;
        pet.gender = data.gender;
        pet.status = data.status;

        await pet.save();

        resolve({
          errCode: 0,
          errMessage: "Update pet successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deletePet = (petId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pet = await db.Pet.findOne({
        where: { id: petId },
      });

      if (!pet) {
        resolve({
          errCode: 2,
          errMessage: "Pet not found",
        });
      }

      await db.Pet.destroy({
        where: { id: petId },
      });

      resolve({
        errCode: 0,
        message: "Pet deleted successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getPetDetail = (petId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!petId) {
        return resolve({
          errCode: 1,
          errMessage: "Missing petId",
          data: {},
        });
      }

      // tìm thú cưng theo id
      let pet = await db.Pet.findOne({
        where: { id: petId },
        include: [
          {
            model: db.Allcode,
            as: "speciesData",
            attributes: ["keyMap", "valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["keyMap", "valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "ageData",
            attributes: ["keyMap", "valueEN", "valueVI"],
          },
        ],
        raw: false,
        nest: true,
      });

      if (!pet) {
        return resolve({
          errCode: 2,
          errMessage: "Pet not found",
          data: {},
        });
      }

      return resolve({
        errCode: 0,
        errMessage: "OK",
        data: pet,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getPetsByEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) {
        return resolve({
          errCode: 1,
          errMessage: "Missing email",
          data: [],
        });
      }

      // tìm user theo email
      let user = await db.User.findOne({
        where: { email: email },
        attributes: ["id"],
      });

      if (!user) {
        return resolve({
          errCode: 2,
          errMessage: "Email not found",
          data: [],
        });
      }

      // lấy danh sách thú cưng theo ownerId
      let pets = await db.Pet.findAll({
        where: { ownerId: user.id },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.Allcode,
            as: "speciesData",
            attributes: ["keyMap", "valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["keyMap", "valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "ageData",
            attributes: ["keyMap", "valueEN", "valueVI"],
          },
          {
            model: db.User,
            as: "owner",
            attributes: ["email", "firstName", "lastName", "phoneNumber"],
          },
        ],
        raw: false,
        nest: true,
      });

      return resolve({
        errCode: 0,
        errMessage: "OK",
        data: pets,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCodes = (type) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!type) {
        return resolve({
          errCode: 1,
          errMessage: "Missing type parameter",
        });
      }

      let codes = await db.Allcode.findAll({
        where: { type },
        attributes: ["keyMap", "valueEN", "valueVI"],
        order: [["keyMap", "ASC"]],
      });

      resolve({
        errCode: 0,
        data: codes,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewPet,
  updatePetData,
  deletePet,
  getPetDetail,
  getPetsByEmail,
  getAllCodes,
};
