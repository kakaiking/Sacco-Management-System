module.exports = (sequelize, DataTypes) => {
  const Sacco = sequelize.define("Sacco", {
    saccoId: { type: DataTypes.STRING, allowNull: false, unique: true },
    licenseId: { type: DataTypes.STRING, allowNull: false, unique: true },
    saccoName: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: true },
    contactPhone: { type: DataTypes.STRING, allowNull: true },
    contactEmail: { type: DataTypes.STRING, allowNull: true },
    logs: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Active" },
    createdOn: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    createdBy: { type: DataTypes.STRING, allowNull: true },
    modifiedOn: { type: DataTypes.DATE, allowNull: true },
    modifiedBy: { type: DataTypes.STRING, allowNull: true },
    approvedBy: { type: DataTypes.STRING, allowNull: true },
    approvedOn: { type: DataTypes.DATE, allowNull: true },
    verifierRemarks: { type: DataTypes.TEXT, allowNull: true },
    isDeleted: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });

  return Sacco;
};
