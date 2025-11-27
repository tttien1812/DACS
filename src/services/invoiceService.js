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

module.exports = {
  createInvoiceService,
};
