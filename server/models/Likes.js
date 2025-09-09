module.exports = (sequelize, DataTypes) => {
  const Likes = sequelize.define("Likes");
  Likes.associate = (models) => {
    Likes.belongsTo(models.Posts, {
      onDelete: "NO ACTION",
    });
    Likes.belongsTo(models.Users, {
      onDelete: "NO ACTION",
    });
  };
  return Likes;
};
