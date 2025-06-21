const express = require('express');
const app = express();
const db = require('./src/config/database');
const {sequelize} = require('./src/models');
const userRoutes = require('./src/routes/user_route');
const balancesRoutes = require('./src/routes/balances_route');

db.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRoutes);
app.use('/balances', balancesRoutes);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});