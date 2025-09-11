const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db = require("./models");

// Routers
const postRouter = require("./routes/Posts");
app.use("/posts", postRouter);
const commentsRouter = require("./routes/Comments");
app.use("/comments", commentsRouter);
const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);
const likesRouter = require("./routes/Likes");
app.use("/likes", likesRouter);
const membersRouter = require("./routes/Members");
app.use("/members", membersRouter);
const productsRouter = require("./routes/Products");
app.use("/products", productsRouter);
const accountsRouter = require("./routes/Accounts");
app.use("/accounts", accountsRouter);

db.sequelize.sync().then(() => {
  try {
    app.listen(3001, () => {
      console.log("Server running on port 3001");
    });
  } catch (error) {
    //send back response of the error
    console.log(error);
    res.status(500).json({ error: error.message }); 
  }
  
});
