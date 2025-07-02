const express = require('express');
const app = express();
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

function errorHandler(err,req,res,next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  switch(err.name) {
    case "Invalid Token":
    case "JsonWebTokenError":
      status = 401;
      message = "Invalid token"
      break
  }
  res.status(status).json({message})
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