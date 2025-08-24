require("dotenv").config();
const express = require('express');
const app = express();
const { AppError } = require('./src/utils/index');
const ngrok = require('ngrok');
const db = require('./src/config/database');
const {sequelize} = require('./src/models');
const userRoutes = require('./src/routes/user_route');
const balanceRoutes = require('./src/routes/balances_route');
const plannerBookRoutes = require('./src/routes/planner_books_route');
const transactionRoutes = require('./src/routes/transaction_route');

db.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/user', userRoutes);
app.use('/balance', balanceRoutes);
app.use('/planner_books', plannerBookRoutes);
app.use('/transactions', transactionRoutes);
app.use(errorHandler);

function errorHandler(err, req, res, next) {
  console.error("Global Error Handler:", err); // Logging error

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === "Invalid Token" || err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token has expired, please login again" });
  }

  // Default to 500 server error
  return res.status(500).json({ error: "Internal Server Error" });
}

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');

    app.listen(3000, () => {
        console.log(`Server is running on port 3000`);

        ngrok.connect(3000)
          .then(url => {
            console.log(`Ngrok tunnel established at ${url}`);
          })
          .catch(err => {
            console.error('Error establishing ngrok tunnel:', err);
          });
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });