const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        error: "No token",
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({
      error: "Invalid token",
    });
  }
}

module.exports = authMiddleware;
