require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db = require("./models");

// Routers
const usersRouter = require("./routes/Users");
app.use("/users", usersRouter);
app.use("/auth", usersRouter);
const membersRouter = require("./routes/Members");
app.use("/members", membersRouter);
const productsRouter = require("./routes/Products");
app.use("/products", productsRouter);
const accountsRouter = require("./routes/Accounts");
app.use("/accounts", accountsRouter);
const saccoRouter = require("./routes/Sacco");
app.use("/sacco", saccoRouter);
const branchRouter = require("./routes/Branch");
app.use("/branch", branchRouter);
const rolesRouter = require("./routes/Roles");
app.use("/roles", rolesRouter);
const currencyRouter = require("./routes/Currency");
app.use("/currencies", currencyRouter);
const chargesRouter = require("./routes/Charges");
app.use("/charges", chargesRouter);
const logsRouter = require("./routes/Logs");
app.use("/logs", logsRouter);
const transactionsRouter = require("./routes/Transactions");
app.use("/transactions", transactionsRouter);

db.sequelize.sync().then(() => {
  try {
    app.listen(3001, () => {
      console.log("Server running on port 3001");
    });
  } catch (error) {
    //send back response of the error
    console.log(error);
  }
  
}).catch((error) => {
  console.error("Database sync failed:", error);
});
