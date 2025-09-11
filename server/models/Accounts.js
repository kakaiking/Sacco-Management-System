module.exports = (sequelize, DataTypes) => {
  const Accounts = sequelize.define("Accounts", {
    accountId: { type: DataTypes.STRING, allowNull: false, unique: true },
    memberId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    accountName: { type: DataTypes.STRING, allowNull: false },
    accountNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    availableBalance: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Active" },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    createdOn: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.STRING, allowNull: true },
    modifiedOn: { type: DataTypes.DATE, allowNull: true },
    modifiedBy: { type: DataTypes.STRING, allowNull: true },
    statusChangedBy: { type: DataTypes.STRING, allowNull: true },
    statusChangedOn: { type: DataTypes.DATE, allowNull: true },
    isDeleted: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    timestamps: false // Disable automatic createdAt/updatedAt
  });

  // Define associations
  Accounts.associate = (models) => {
    // Account belongs to one Member
    Accounts.belongsTo(models.Members, {
      foreignKey: 'memberId',
      as: 'member',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Account belongs to one Product
    Accounts.belongsTo(models.Products, {
      foreignKey: 'productId',
      as: 'product',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  };

  return Accounts;
};
