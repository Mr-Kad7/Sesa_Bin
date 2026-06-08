const jwt = require("jsonwebtoken");
const pool = require("../../lib/postgres");

function jwtSecret() {
  return process.env.JWT_SECRET || "development_jwt_secret_change_me";
}

module.exports = async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let currentUser;

    try {
      currentUser = jwt.verify(token, jwtSecret());
    } catch (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    // GET
    if (req.method === "GET") {
      const result = await pool.query(
        "SELECT * FROM pickups ORDER BY created_at DESC"
      );
      return res.status(200).json({
        success: true,
        pickups: result.rows,
      });
    }

    // POST
    if (req.method === "POST") {
      const name = (req.body.name || currentUser.name || "").trim();
      const wasteType = (req.body.wasteType || req.body.waste_type || "").trim();
      const quantity = (req.body.quantity || "").trim();
      const location = (req.body.location || "").trim();

      if (!name || !wasteType || !quantity || !location) {
        return res.status(400).json({
          error: "Name, waste type, quantity, and location are required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO pickups (user_id, name, waste_type, quantity, location)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [currentUser.id || null, name, wasteType, quantity, location]
      );

      const pickup = result.rows[0];
      const notification = await pool.query(
        `
        INSERT INTO admin_notifications (pickup_id, message)
        VALUES ($1, $2)
        RETURNING *
        `,
        [
          pickup.id,
          `${name} scheduled a ${wasteType} pickup at ${location}`,
        ]
      );

      return res.status(201).json({
        ...pickup,
        adminNotification: notification.rows[0],
      });
    }

    // PATCH
    if (req.method === "PATCH") {
      const { id, status } = req.body;

      const result = await pool.query(
        `
        UPDATE pickups
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

      return res.status(200).json(result.rows[0]);
    }

    // DELETE
    if (req.method === "DELETE") {
      const { id } = req.body;

      await pool.query(
        "DELETE FROM pickups WHERE id = $1",
        [id]
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Ensure interoperability with ESM-style default import expected by Next.js
module.exports.default = module.exports;
