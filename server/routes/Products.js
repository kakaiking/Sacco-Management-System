const express = require("express");
const router = express.Router();
const { Products } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { logViewOperation, logCreateOperation, logUpdateOperation, logDeleteOperation } = require("../middlewares/LoggingMiddleware");
const { Op } = require("sequelize");

const respond = (res, code, message, entity) => {
  res.status(code).json({ code, message, entity });
};

// List with optional status filter and search
router.get("/", validateToken, logViewOperation("Product"), async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = { 
      isDeleted: 0,
      status: { [Op.ne]: "Deleted" } // Exclude deleted products
    };
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { productId: { [Op.like]: `%${q}%` } },
        { productName: { [Op.like]: `%${q}%` } },
        { currency: { [Op.like]: `%${q}%` } },
      ];
    }
    const products = await Products.findAll({ where, order: [["createdOn", "DESC"]] });
    respond(res, 200, "Products fetched", products);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Get one
router.get("/:id", validateToken, logViewOperation("Product"), async (req, res) => {
  try {
    const product = await Products.findByPk(req.params.id);
    if (!product || product.isDeleted || product.status === "Deleted") return respond(res, 404, "Not found");
    respond(res, 200, "Product fetched", product);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Create
router.post("/", validateToken, logCreateOperation("Product"), async (req, res) => {
  try {
    const data = req.body || {};
    const username = req.user?.username || null;
    const payload = {
      productId: data.productId,
      productName: data.productName,
      saccoId: data.saccoId || null,
      chargeIds: data.chargeIds || null,
      currency: data.currency,
      interestRate: data.interestRate || null,
      interestType: data.interestType || null,
      interestCalculationRule: data.interestCalculationRule || null,
      interestFrequency: data.interestFrequency || null,
      isCreditInterest: data.isCreditInterest || false,
      isDebitInterest: data.isDebitInterest || false,
      needGuarantors: data.needGuarantors || false,
      maxGuarantors: data.maxGuarantors || null,
      minGuarantors: data.minGuarantors || null,
      isSpecial: data.isSpecial || false,
      maxSpecialUsers: data.maxSpecialUsers || null,
      onMemberOnboarding: data.onMemberOnboarding || false,
      appliedOnMemberOnboarding: data.appliedOnMemberOnboarding || false,
      isWithdrawable: data.isWithdrawable !== undefined ? data.isWithdrawable : true,
      withdrawableFrom: data.withdrawableFrom || null,
      productType: data.productType || 'BOSA',
      productStatus: data.productStatus || "Pending",
      status: "Pending",
      createdOn: new Date(),
      createdBy: username,
    };
    const created = await Products.create(payload);
    respond(res, 201, "Product created", created);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Update
router.put("/:id", validateToken, logUpdateOperation("Product"), async (req, res) => {
  try {
    const data = req.body || {};
    const username = req.user?.username || null;
    const updatePayload = {
      productId: data.productId,
      productName: data.productName,
      saccoId: data.saccoId || null,
      chargeIds: data.chargeIds || null,
      currency: data.currency,
      interestRate: data.interestRate || null,
      interestType: data.interestType || null,
      interestCalculationRule: data.interestCalculationRule || null,
      interestFrequency: data.interestFrequency || null,
      isCreditInterest: data.isCreditInterest || false,
      isDebitInterest: data.isDebitInterest || false,
      needGuarantors: data.needGuarantors || false,
      maxGuarantors: data.maxGuarantors || null,
      minGuarantors: data.minGuarantors || null,
      isSpecial: data.isSpecial || false,
      maxSpecialUsers: data.maxSpecialUsers || null,
      onMemberOnboarding: data.onMemberOnboarding || false,
      appliedOnMemberOnboarding: data.appliedOnMemberOnboarding || false,
      isWithdrawable: data.isWithdrawable !== undefined ? data.isWithdrawable : undefined,
      withdrawableFrom: data.withdrawableFrom !== undefined ? data.withdrawableFrom : undefined,
      productType: data.productType || undefined,
      productStatus: data.productStatus || undefined,
      verifierRemarks: data.verifierRemarks || null,
      status: data.status || undefined,
      modifiedOn: new Date(),
      modifiedBy: username,
    };
    const [count] = await Products.update(updatePayload, { 
      where: { 
        id: req.params.id, 
        isDeleted: 0,
        status: { [Op.ne]: "Deleted" }
      } 
    });
    if (!count) return respond(res, 404, "Not found");
    const updated = await Products.findByPk(req.params.id);
    respond(res, 200, "Product updated", updated);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Soft delete
router.delete("/:id", validateToken, logDeleteOperation("Product"), async (req, res) => {
  try {
    const [count] = await Products.update({ 
      isDeleted: 1, 
      status: "Deleted",
      modifiedOn: new Date(),
      modifiedBy: req.user?.username || "System"
    }, { where: { id: req.params.id } });
    if (!count) return respond(res, 404, "Not found");
    respond(res, 200, "Product deleted");
  } catch (err) {
    respond(res, 500, err.message);
  }
});

module.exports = router;
