const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  cors(
  )
);

app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
const user = require("./controller/user");
const dashboard = require("./controller/dasboard");
const productType = require("./controller/jenisBarang");
const product = require("./controller/product");
const supplier = require("./controller/supplier");
const transaction = require("./controller/transaction");

app.use("/user", user);
app.use("/dashboard", dashboard);
app.use("/product-type", productType);
app.use("/product", product);
app.use("/supplier", supplier);
app.use("/transaction", transaction);


// app.use("", welcome);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
