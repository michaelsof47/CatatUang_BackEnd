const express = require('express');
const app = express();
const db = require('./src/config/database');
const {sequelize} = require('./src/models');
const userRoutes = require('./src/routes/user_route');
const balancesRoutes = require('./src/routes/balances_route');
const plannerBookRoutes = require('./src/routes/planner_books_route');

db.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/user', userRoutes);
app.use('/balances', balancesRoutes);
app.use('/planner_books', plannerBookRoutes);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully.');

    app.listen(3000, () => {
        console.log(`Server is running on port 3000`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });