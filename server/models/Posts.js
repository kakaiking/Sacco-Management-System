module.exports = (sequelize, DataTypes) => {
  const Posts = sequelize.define("Posts", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Posts.associate = (models) => {
    Posts.hasMany(models.Comments, {
      onDelete: "NO ACTION",
    });

    Posts.hasMany(models.Likes, {
      onDelete: "NO ACTION",
    });

    Posts.belongsTo(models.Users, {
      onDelete: "NO ACTION",
    });
  };
  return Posts;
};
