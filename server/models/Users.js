module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Users.associate = (models) => {
    Users.hasMany(models.Likes, {
      onDelete: "NO ACTION",
    });

    Users.hasMany(models.Posts, {
      onDelete: "NO ACTION",
    });
  };

  return Users;
};
