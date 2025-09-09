const express = require("express");
const router = express.Router();
const { Products } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

const respond = (res, code, message, entity) => {
  res.status(code).json({ code, message, entity });
};

// List with optional status filter and search
router.get("/", validateToken, async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = { isDeleted: 0 };
    if (status) where.status = status;
    if (q) {
      const { Op } = require("sequelize");
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
router.get("/:id", validateToken, async (req, res) => {
  try {
    const product = await Products.findByPk(req.params.id);
    if (!product || product.isDeleted) return respond(res, 404, "Not found");
    respond(res, 200, "Product fetched", product);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Create
router.post("/", validateToken, async (req, res) => {
  try {
    const data = req.body || {};
    const username = req.user?.username || null;
    const payload = {
      productId: data.productId,
      productName: data.productName,
      productStatus: data.productStatus || "Pending",
      currency: data.currency,
      isCreditInterest: data.isCreditInterest || false,
      isDebitInterest: data.isDebitInterest || false,
      interestType: data.interestType || null,
      interestCalculationRule: data.interestCalculationRule || null,
      interestFrequency: data.interestFrequency || null,
      appliedOnMemberOnboarding: data.appliedOnMemberOnboarding || false,
      createdOn: new Date(),
      createdBy: username,
      status: "Pending",
    };
    const created = await Products.create(payload);
    respond(res, 201, "Product created", created);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Update
router.put("/:id", validateToken, async (req, res) => {
  try {
    const data = req.body || {};
    const username = req.user?.username || null;
    const updatePayload = {
      productId: data.productId,
      productName: data.productName,
      productStatus: data.productStatus || undefined,
      currency: data.currency,
      isCreditInterest: data.isCreditInterest || false,
      isDebitInterest: data.isDebitInterest || false,
      interestType: data.interestType || null,
      interestCalculationRule: data.interestCalculationRule || null,
      interestFrequency: data.interestFrequency || null,
      appliedOnMemberOnboarding: data.appliedOnMemberOnboarding || false,
      verifierRemarks: data.verifierRemarks || null,
      status: data.status || undefined,
      modifiedOn: new Date(),
      modifiedBy: username,
    };
    const [count] = await Products.update(updatePayload, { where: { id: req.params.id, isDeleted: 0 } });
    if (!count) return respond(res, 404, "Not found");
    const updated = await Products.findByPk(req.params.id);
    respond(res, 200, "Product updated", updated);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Soft delete
router.delete("/:id", validateToken, async (req, res) => {
  try {
    const [count] = await Products.update({ isDeleted: 1 }, { where: { id: req.params.id } });
    if (!count) return respond(res, 404, "Not found");
    respond(res, 200, "Product deleted");
  } catch (err) {
    respond(res, 500, err.message);
  }
});

module.exports = router;
