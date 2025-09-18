const express = require("express");
const router = express.Router();
const { Transactions, Accounts, Members, Products, Sacco } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { logViewOperation, logCreateOperation, logUpdateOperation, logDeleteOperation } = require("../middlewares/LoggingMiddleware");
const { Op } = require("sequelize");

// Helper function to generate Transaction ID
const generateTransactionId = () => {
  const randomNum = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  return `T-${randomNum}`;
};

// Helper function to respond
const respond = (res, code, message, entity) => {
  res.status(code).json({ code, message, entity });
};

// List with optional status filter and search
router.get("/", validateToken, logViewOperation("Transaction"), async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = { 
      isDeleted: 0,
      status: { [Op.ne]: "Deleted" } // Exclude deleted transactions
    };
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { transactionId: { [Op.like]: `%${q}%` } },
        { remarks: { [Op.like]: `%${q}%` } }
      ];
    }
    const transactions = await Transactions.findAll({ 
      where, 
      include: [
        { model: Sacco, as: 'sacco' },
        { 
          model: Accounts, 
          as: 'debitAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        },
        { 
          model: Accounts, 
          as: 'creditAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        }
      ],
      order: [["createdOn", "DESC"]] 
    });
    respond(res, 200, "Transactions fetched", transactions);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Get one
router.get("/:id", validateToken, logViewOperation("Transaction"), async (req, res) => {
  try {
    const transaction = await Transactions.findByPk(req.params.id, {
      include: [
        { model: Sacco, as: 'sacco' },
        { 
          model: Accounts, 
          as: 'debitAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        },
        { 
          model: Accounts, 
          as: 'creditAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        }
      ]
    });
    if (!transaction || transaction.isDeleted) return respond(res, 404, "Not found");
    respond(res, 200, "Transaction fetched", transaction);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Create
router.post("/", validateToken, logCreateOperation("Transaction"), async (req, res) => {
  try {
    const data = req.body || {};
    const username = req.user?.username || null;
    
    // Validate required fields
    if (!data.saccoId) {
      return respond(res, 400, "Sacco ID is required", null);
    }
    if (!data.debitAccountId) {
      return respond(res, 400, "Debit Account ID is required", null);
    }
    if (!data.creditAccountId) {
      return respond(res, 400, "Credit Account ID is required", null);
    }
    if (!data.amount || data.amount <= 0) {
      return respond(res, 400, "Valid amount is required", null);
    }

    // Check if debit and credit accounts are different
    if (data.debitAccountId === data.creditAccountId) {
      return respond(res, 400, "Debit and credit accounts cannot be the same", null);
    }

    // Verify accounts exist and belong to the same sacco
    const [debitAccount, creditAccount] = await Promise.all([
      Accounts.findByPk(data.debitAccountId, { include: [{ model: Members, as: 'member' }] }),
      Accounts.findByPk(data.creditAccountId, { include: [{ model: Members, as: 'member' }] })
    ]);

    if (!debitAccount || !creditAccount) {
      return respond(res, 400, "One or both accounts not found", null);
    }

    if (debitAccount.saccoId !== data.saccoId || creditAccount.saccoId !== data.saccoId) {
      return respond(res, 400, "Accounts must belong to the same SACCO", null);
    }

    const transactionId = generateTransactionId();
    const payload = {
      transactionId,
      saccoId: data.saccoId,
      debitAccountId: parseInt(data.debitAccountId),
      creditAccountId: parseInt(data.creditAccountId),
      amount: parseFloat(data.amount),
      status: data.status || "Pending",
      remarks: data.remarks || null,
      createdOn: new Date(),
      createdBy: username,
    };
    
    const created = await Transactions.create(payload);
    
    // Fetch the created transaction with all associations
    const transactionWithAssociations = await Transactions.findByPk(created.id, {
      include: [
        { model: Sacco, as: 'sacco' },
        { 
          model: Accounts, 
          as: 'debitAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        },
        { 
          model: Accounts, 
          as: 'creditAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        }
      ]
    });
    
    respond(res, 201, "Transaction created", transactionWithAssociations);
  } catch (err) {
    console.error("Error creating transaction:", err);
    respond(res, 500, `Server error: ${err.message}`, null);
  }
});

// Update
router.put("/:id", validateToken, logUpdateOperation("Transaction"), async (req, res) => {
  try {
    const data = req.body || {};
    const username = req.user?.username || null;
    
    const updatePayload = {
      amount: data.amount !== undefined ? parseFloat(data.amount) : undefined,
      status: data.status || undefined,
      remarks: data.remarks !== undefined ? data.remarks : undefined,
      verifierRemarks: data.verifierRemarks || undefined,
      modifiedOn: new Date(),
      modifiedBy: username,
    };

    // Remove undefined values
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const [count] = await Transactions.update(updatePayload, { 
      where: { 
        id: req.params.id, 
        isDeleted: 0,
        status: { [Op.ne]: "Deleted" }
      } 
    });
    
    if (!count) return respond(res, 404, "Not found");
    
    const updated = await Transactions.findByPk(req.params.id, {
      include: [
        { model: Sacco, as: 'sacco' },
        { 
          model: Accounts, 
          as: 'debitAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        },
        { 
          model: Accounts, 
          as: 'creditAccount',
          include: [
            { model: Members, as: 'member' },
            { model: Products, as: 'product' }
          ]
        }
      ]
    });
    
    respond(res, 200, "Transaction updated", updated);
  } catch (err) {
    respond(res, 500, err.message);
  }
});

// Soft delete
router.delete("/:id", validateToken, logDeleteOperation("Transaction"), async (req, res) => {
  try {
    const [count] = await Transactions.update({ 
      isDeleted: 1, 
      status: "Deleted",
      modifiedOn: new Date(),
      modifiedBy: req.user?.username || "System"
    }, { where: { id: req.params.id } });
    if (!count) return respond(res, 404, "Not found");
    respond(res, 200, "Transaction deleted");
  } catch (err) {
    respond(res, 500, err.message);
  }
});

module.exports = router;
