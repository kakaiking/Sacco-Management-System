module.exports = (sequelize, DataTypes) => {
  const Transactions = sequelize.define("Transactions", {
    transactionId: { type: DataTypes.STRING, allowNull: false, unique: true },
    saccoId: { type: DataTypes.STRING, allowNull: false },
    debitAccountId: { type: DataTypes.INTEGER, allowNull: false },
    creditAccountId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    createdOn: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    createdBy: { type: DataTypes.STRING, allowNull: true },
    modifiedOn: { type: DataTypes.DATE, allowNull: true },
    modifiedBy: { type: DataTypes.STRING, allowNull: true },
    approvedBy: { type: DataTypes.STRING, allowNull: true },
    approvedOn: { type: DataTypes.DATE, allowNull: true },
    verifierRemarks: { type: DataTypes.TEXT, allowNull: true },
    isDeleted: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });

  // Define associations
  Transactions.associate = (models) => {
    // Transaction belongs to Sacco
    Transactions.belongsTo(models.Sacco, {
      foreignKey: 'saccoId',
      as: 'sacco'
    });

    // Transaction belongs to Debit Account
    Transactions.belongsTo(models.Accounts, {
      foreignKey: 'debitAccountId',
      as: 'debitAccount'
    });

    // Transaction belongs to Credit Account
    Transactions.belongsTo(models.Accounts, {
      foreignKey: 'creditAccountId',
      as: 'creditAccount'
    });
  };

  return Transactions;
};
