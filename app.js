require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const db = require("./models");

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const productRoutes = require("./routes/productRoutes");
const productionRoutes = require("./routes/productionRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const materialRoutes = require("./routes/materialRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const stockRoutes = require("./routes/stockRoutes");

app.use("/auth", authRoutes);

app.use("/dashboard", dashboardRoutes);

app.use("/sales", saleRoutes);

app.use("/productions", productionRoutes);

app.use("/products", productRoutes);

app.use("/suppliers", supplierRoutes);

app.use("/materials", materialRoutes);

app.use("/recipes", recipeRoutes);

app.use("/stocks", stockRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Medici API" });
});

const errorMiddleware = require("./middlewares/errorMiddleware");
app.use(errorMiddleware);
app.listen(3000, async () => {
  await db.sequelize.authenticate();

  console.log("DB connected");
  console.log("Server running");
});
