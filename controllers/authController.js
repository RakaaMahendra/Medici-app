const { register, login } = require("../services/authService");

async function registerUser(req, res, next) {
  try {
    const user = await register(req.body);

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const token = await login(email, password);

    res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerUser,
  loginUser,
};
