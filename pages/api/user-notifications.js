const jwt = require("jsonwebtoken");
const pool = require("../../lib/postgres");

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
    const user = authenticate(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const result = await pool.query(
        `SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id]
      );

      return res.status(200).json({
        success: true,
        notifications: result.rows,
      });
    }

    if (req.method === "PATCH") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Notification id is required" });
      }

      const result = await pool.query(
        `UPDATE user_notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, user.id]
      );

      return res.status(200).json({
        success: true,
        notification: result.rows[0],
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports.default = module.exports;
