// services/invoiceService.js
import db from "../models/index";

let createInvoiceService = async (data) => {
  const t = await db.sequelize.transaction();

  try {
    if (!data.userId || !data.petId || !data.doctorId) {
      return {
        errCode: 1,
        errMessage: "Missing required parameters",
      };
    }

    // Tính tổng tiền
    let totalPrice = 0;
    if (data.items && data.items.length > 0) {
      totalPrice = data.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
    }

    // 1. Tạo Invoice
    let invoice = await db.Invoice.create(
      {
        userId: data.userId,
        petId: data.petId,
        doctorId: data.doctorId,
        bookingId: data.bookingId,
        note: data.note || "",
        totalPrice: totalPrice,
        paymentStatus: "pending",
      },
      { transaction: t }
    );

    // 2. Tạo InvoiceItem(s)
    if (data.items && data.items.length > 0) {
      const invoiceItems = data.items.map((item) => ({
        invoiceId: invoice.id,
        medicineId: item.medicineId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      await db.InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
    }

    await db.Pet.update(
      { isPrescribed: 1 },
      {
        where: { id: data.petId },
        transaction: t,
      }
    );

    // Commit
    await t.commit();

    return {
      errCode: 0,
      errMessage: "Invoice created successfully",
      data: invoice,
    };
  } catch (e) {
    console.log(e);

    // Rollback khi lỗi
    await t.rollback();

    return {
      errCode: -1,
      errMessage: "Error creating invoice",
    };
  }
};

let getInvoiceByBookingId = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Lấy booking
      let booking = await db.Booking.findOne({
        where: { id: bookingId },
      });

      console.log(">>> DEBUG: booking =", booking);

      if (!booking) {
        return resolve({
          errCode: 1,
          errMessage: "Booking không tồn tại",
        });
      }

      const petId = booking.petId;

      if (!petId) {
        return resolve({
          errCode: 2,
          errMessage: "Booking này chưa có thú cưng",
        });
      }

      // 2. Lấy invoice theo petId
      const invoice = await db.Invoice.findOne({
        where: { petId: petId },
        include: [
          {
            model: db.User,
            as: "userData",
            attributes: ["id", "firstName", "lastName", "phoneNumber", "email"],
          },
          {
            model: db.User,
            as: "doctorData",
            attributes: ["id", "firstName", "lastName"],

            include: [
              {
                model: db.Doctor_Infor,
                as: "doctorInfo",
                attributes: ["id", "priceID"],
                include: [
                  {
                    model: db.Allcode,
                    as: "priceTypeData",
                    attributes: ["keyMap", "valueEN", "valueVI"],
                  },
                ],
              },
            ],
          },
          {
            model: db.Pet,
            as: "petData",
            attributes: ["id", "name", "species", "breed"],
            include: [
              {
                model: db.Allcode,
                as: "speciesData",
                attributes: ["keyMap", "valueEN", "valueVI"],
              },
            ],
          },

          {
            model: db.InvoiceItem,
            as: "items",
            include: [
              {
                model: db.Medicine,
                as: "medicineData",
                attributes: ["id", "description", "price"],
              },
            ],
          },
        ],
        order: [[{ model: db.InvoiceItem, as: "items" }, "id", "ASC"]],
        raw: false,
        nest: true,
      });

      if (!invoice) {
        return resolve({
          errCode: 3,
          errMessage: "Không tìm thấy hóa đơn nào của thú cưng này",
        });
      }

      return resolve({
        errCode: 0,
        errMessage: "OK",
        data: invoice,
      });
    } catch (e) {
      console.log(">>> SERVER ERROR:", e);
      reject(e);
    }
  });
};

module.exports = {
  createInvoiceService,
  getInvoiceByBookingId,
};
