module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define("Products", {
    productId: { type: DataTypes.STRING, allowNull: false, unique: true },
    productName: { type: DataTypes.STRING, allowNull: false },
    productStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
    currency: { type: DataTypes.STRING, allowNull: false },
    isCreditInterest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isDebitInterest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    interestType: { type: DataTypes.STRING, allowNull: true },
    interestCalculationRule: { type: DataTypes.STRING, allowNull: true },
    interestFrequency: { type: DataTypes.STRING, allowNull: true },
    appliedOnMemberOnboarding: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdOn: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    createdBy: { type: DataTypes.STRING, allowNull: true },
    modifiedOn: { type: DataTypes.DATE, allowNull: true },
    modifiedBy: { type: DataTypes.STRING, allowNull: true },
    approvedBy: { type: DataTypes.STRING, allowNull: true },
    approvedOn: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
    verifierRemarks: { type: DataTypes.TEXT, allowNull: true },
    isDeleted: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });

  return Products;
};
