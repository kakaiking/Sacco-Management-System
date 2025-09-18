module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define("Products", {
    productId: { type: DataTypes.STRING, allowNull: false, unique: true },
    productName: { type: DataTypes.STRING, allowNull: false },
    saccoId: { type: DataTypes.STRING, allowNull: true },
    chargeIds: { type: DataTypes.TEXT, allowNull: true },
    currency: { type: DataTypes.STRING, allowNull: false },
    interestRate: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    interestType: { type: DataTypes.STRING, allowNull: true },
    interestCalculationRule: { type: DataTypes.STRING, allowNull: true },
    interestFrequency: { type: DataTypes.STRING, allowNull: true },
    isCreditInterest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isDebitInterest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    needGuarantors: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    maxGuarantors: { type: DataTypes.INTEGER, allowNull: true },
    minGuarantors: { type: DataTypes.INTEGER, allowNull: true },
    isSpecial: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    maxSpecialUsers: { type: DataTypes.INTEGER, allowNull: true },
    appliedOnMemberOnboarding: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isWithdrawable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    withdrawableFrom: { type: DataTypes.DATEONLY, allowNull: true },
    productType: { type: DataTypes.ENUM('BOSA', 'FOSA'), allowNull: false, defaultValue: 'BOSA' },
    productStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
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
  Products.associate = (models) => {
    // Product belongs to Sacco
    Products.belongsTo(models.Sacco, {
      foreignKey: 'saccoId',
      as: 'sacco'
    });
    
    // Product has many Accounts
    Products.hasMany(models.Accounts, {
      foreignKey: 'productId',
      as: 'accounts'
    });
  };

  return Products;
};
