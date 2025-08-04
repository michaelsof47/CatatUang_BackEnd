const { createContainer, asFunction, asValue } = require("awilix");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const redis = require("./config/redis");

const User = require("./models/user");
const Balances = require("./models/balance");
const Transaction = require("./models/transaction");
const Category = require("./models/category");
const PlannerBook = require("./models/planner_book");
const DetailPlannerBook = require("./models/detail_planner_book");

const container = createContainer();

container.register({
  bcrypt: asValue(bcrypt),
  jwt: asValue(jwt),
  sharp: asValue(sharp),
  Op: asValue(Op),
  redis: asValue(redis),
});

container.register({
  User: asValue(User),
  Balances: asValue(Balances),
  Transaction: asValue(Transaction),
  Category: asValue(Category),
  PlannerBook: asValue(PlannerBook),
  DetailPlannerBook: asValue(DetailPlannerBook),
});

container.loadModules(["src/controller/*.js", "src/middleware/*.js"], {
  formatName: "camelCase",
  resolverOptions: {
    register: asFunction,
  },
});

container.register({
  generateToken: asFunction(
    ({ jwt }) =>
      (id) =>
        jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        })
  ).singleton(),

  bufferToBase64: asFunction(() => (buffer) => {
    return buffer.toString("base64");
  }).singleton(),

  base64ToBuffer: asFunction(() => (base64) => {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return Buffer.from(base64, "base64");
    }

    return Buffer.from(matches[2], "base64");
  }).singleton(),
});

module.exports = container;
