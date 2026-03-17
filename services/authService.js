const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

async function register(data) {
  return await User.create(data);
}

async function login(email, password) {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) {
    throw new Error("Wrong password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    SECRET
  );

  return token;
}

module.exports = {
  register,
  login,
};
