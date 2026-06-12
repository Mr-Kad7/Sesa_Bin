const jwt = require("jsonwebtoken");

function jwtSecret() {
  return process.env.JWT_SECRET || "development_jwt_secret_change_me";
}

function authenticate(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    return jwt.verify(token, jwtSecret());
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
    return null;
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const user = authenticate(req, res);
    if (!user) return;

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin || user.is_admin || false,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports.default = module.exports;
