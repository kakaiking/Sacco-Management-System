const express = require("express");
const router = express.Router();
const { Members } = require("../models");
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
        { memberNo: { [Op.like]: `%${q}%` } },
        { firstName: { [Op.like]: `%${q}%` } },
        { lastName: { [Op.like]: `%${q}%` } },
        { identificationNumber: { [Op.like]: `%${q}%` } },
      ];
    }
    const members = await Members.findAll({ where, order: [["createdOn", "DESC"]] });
    
    // Parse nextOfKin JSON strings back to objects
    const membersWithParsedNextOfKin = members.map(member => {
      const memberData = member.toJSON();
      if (memberData.nextOfKin) {
        try {
          memberData.nextOfKin = JSON.parse(memberData.nextOfKin);
        } catch (e) {
          memberData.nextOfKin = null;
        }
      }
      return memberData;
    });
    
    respond(res, 200, "Members fetched", membersWithParsedNextOfKin);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Get one
router.get("/:id", validateToken, async (req, res) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member || member.isDeleted) return respond(res, 404, "Not found");
    
    // Parse nextOfKin JSON string back to object
    const memberData = member.toJSON();
    if (memberData.nextOfKin) {
      try {
        memberData.nextOfKin = JSON.parse(memberData.nextOfKin);
      } catch (e) {
        memberData.nextOfKin = null;
      }
    }
    
    respond(res, 200, "Member fetched", memberData);
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
      memberNo: data.memberNo,
      title: data.title || null,
      firstName: data.firstName,
      lastName: data.lastName,
      category: data.category || null,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      identificationType: data.identificationType,
      identificationNumber: data.identificationNumber,
      identificationExpiryDate: data.identificationExpiryDate || null,
      kraPin: data.kraPin || null,
      maritalStatus: data.maritalStatus || null,
      country: data.country || null,
      county: data.county || null,
      email: data.email || null,
      personalPhone: data.personalPhone || null,
      alternativePhone: data.alternativePhone || null,
      nextOfKin: data.nextOfKin ? JSON.stringify(data.nextOfKin) : null,
      photo: data.photo || null,
      signature: data.signature || null,
      createdOn: new Date(),
      createdBy: username,
      status: "Pending",
    };
    const created = await Members.create(payload);
    respond(res, 201, "Member created", created);
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
      memberNo: data.memberNo,
      title: data.title || null,
      firstName: data.firstName,
      lastName: data.lastName,
      category: data.category || null,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      identificationType: data.identificationType,
      identificationNumber: data.identificationNumber,
      identificationExpiryDate: data.identificationExpiryDate || null,
      kraPin: data.kraPin || null,
      maritalStatus: data.maritalStatus || null,
      country: data.country || null,
      county: data.county || null,
      email: data.email || null,
      personalPhone: data.personalPhone || null,
      alternativePhone: data.alternativePhone || null,
      nextOfKin: data.nextOfKin ? JSON.stringify(data.nextOfKin) : null,
      photo: data.photo || null,
      signature: data.signature || null,
      verifierRemarks: data.verifierRemarks || null,
      status: data.status || undefined,
      modifiedOn: new Date(),
      modifiedBy: username,
    };
    const [count] = await Members.update(updatePayload, { where: { id: req.params.id, isDeleted: 0 } });
    if (!count) return respond(res, 404, "Not found");
    const updated = await Members.findByPk(req.params.id);
    
    // Parse nextOfKin JSON string back to object
    const updatedData = updated.toJSON();
    if (updatedData.nextOfKin) {
      try {
        updatedData.nextOfKin = JSON.parse(updatedData.nextOfKin);
      } catch (e) {
        updatedData.nextOfKin = null;
      }
    }
    
    respond(res, 200, "Member updated", updatedData);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Soft delete
router.delete("/:id", validateToken, async (req, res) => {
  try {
    const [count] = await Members.update({ isDeleted: 1 }, { where: { id: req.params.id } });
    if (!count) return respond(res, 404, "Not found");
    respond(res, 200, "Member deleted");
  } catch (err) {
    respond(res, 500, err.message);
  }
});

module.exports = router;


