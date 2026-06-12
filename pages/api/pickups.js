const jwt = require("jsonwebtoken");
const pool = require("../../lib/postgres");
const { sendEmail } = require("../../lib/email");

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

function buildPickupEmail({ name, wasteType, quantity, location, status, collectorName, eta, lastKnownLocation }) {
  const statusMessages = {
    Pending: "We received your pickup request and it is pending approval.",
    Approved: "Your pickup has been approved and is waiting for collector assignment.",
    Assigned: "A collector has been assigned to your pickup.",
    "On the Way": "Your pickup is on the way.",
    Completed: "Your pickup has been completed successfully.",
  };

  const subjectMap = {
    Pending: "Pickup request received",
    Approved: "Pickup approved",
    Assigned: "Collector assigned",
    "On the Way": "Pickup is on the way",
    Completed: "Pickup complete",
  };

  const details = [];
  if (collectorName) details.push(`Collector: ${collectorName}`);
  if (eta) details.push(`ETA: ${eta}`);
  if (lastKnownLocation) details.push(`Collector last seen at: ${lastKnownLocation}`);

  const detailsText = details.length ? `\n\n${details.join("\n")}` : "";
  const detailsHtml = details.length
    ? `<ul>${details.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";

  return {
    subject: subjectMap[status] || `Pickup status: ${status}`,
    text: `Hi ${name},\n\n${statusMessages[status] || `Your pickup status is now ${status}.`}\n\nPickup details:\n- Waste: ${wasteType}\n- Quantity: ${quantity}\n- Location: ${location}${detailsText}\n\nThank you for recycling with Sesa Bin.\n`,
    html: `<p>Hi ${name},</p><p>${statusMessages[status] || `Your pickup status is now <strong>${status}</strong>.`}</p><p><strong>Pickup details:</strong></p><ul><li>Waste: ${wasteType}</li><li>Quantity: ${quantity}</li><li>Location: ${location}</li></ul>${detailsHtml}<p>Thank you for recycling with <strong>Sesa Bin</strong>.</p>`,
  };
}

function buildCollectorEmail({ collectorName, pickup, eta }) {
  return {
    subject: `Collector assigned for ${pickup.name}'s pickup`,
    text: `Hi ${collectorName},\n\nYou have been assigned to collect ${pickup.quantity} of ${pickup.waste_type} at ${pickup.location}.${eta ? `\n\nETA: ${eta}` : ""}\n\nPlease update the system when you start the trip and upon completion.\n`,
    html: `<p>Hi ${collectorName},</p><p>You have been assigned to collect <strong>${pickup.quantity}</strong> of <strong>${pickup.waste_type}</strong> at <strong>${pickup.location}</strong>.</p>${eta ? `<p><strong>ETA:</strong> ${eta}</p>` : ""}<p>Please update the system when you start the trip and upon completion.</p>`,
  };
}

function getStatusMessage(pickup, status) {
  switch (status) {
    case "Approved":
      return `Your pickup request for ${pickup.quantity} of ${pickup.waste_type} has been approved.`;
    case "Assigned":
      return `A collector has been assigned to your pickup. ${pickup.collector_name ? `Collector: ${pickup.collector_name}.` : ""}`;
    case "On the Way":
      return `Your pickup is on the way.${pickup.eta ? ` ETA: ${pickup.eta}.` : ""}`;
    case "Completed":
      return `Your pickup has been completed. Thank you for recycling with Sesa Bin.`;
    default:
      return `Pickup status changed to ${status}.`;
  }
}

module.exports = async function handler(req, res) {
  try {
    const currentUser = authenticate(req, res);
    if (!currentUser) return;

    if (req.method === "GET") {
      const query = currentUser.isAdmin
        ? "SELECT * FROM pickups ORDER BY created_at DESC"
        : "SELECT * FROM pickups WHERE user_id = $1 ORDER BY created_at DESC";
      const params = currentUser.isAdmin ? [] : [currentUser.id];
      const result = await pool.query(query, params);

      return res.status(200).json({
        success: true,
        pickups: result.rows,
      });
    }

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
      const adminMessage = `${name} scheduled a ${wasteType} pickup at ${location}`;
      await pool.query(
        `
        INSERT INTO admin_notifications (pickup_id, message)
        VALUES ($1, $2)
        `,
        [pickup.id, adminMessage]
      );

      if (currentUser.id) {
        await pool.query(
          `
          INSERT INTO user_notifications (user_id, pickup_id, message)
          VALUES ($1, $2, $3)
          `,
          [currentUser.id, pickup.id, "Your pickup request has been received and is pending approval."]
        );
      }

      if (currentUser.email) {
        sendEmail({
          to: currentUser.email,
          ...buildPickupEmail({
            name: currentUser.name || name,
            wasteType,
            quantity,
            location,
            status: "Pending",
          }),
        }).catch((err) => console.error("Pickup creation email failed:", err));
      }

      return res.status(201).json({
        ...pickup,
      });
    }

    if (req.method === "PATCH") {
      const { id, status, collectorName, collectorEmail, eta, lastKnownLocation, feedback } = req.body;

      if (!id) {
        return res.status(400).json({
          error: "Pickup id is required",
        });
      }

      const existingPickupQuery = await pool.query(
        `SELECT p.*, u.email AS user_email, u.id AS user_id FROM pickups p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
        [id]
      );

      if (existingPickupQuery.rows.length === 0) {
        return res.status(404).json({ error: "Pickup not found" });
      }

      const pickupRow = existingPickupQuery.rows[0];

      if (!currentUser.isAdmin) {
        if (pickupRow.user_id !== currentUser.id) {
          return res.status(403).json({ error: "Not authorized" });
        }

        if (typeof feedback === "undefined") {
          return res.status(403).json({ error: "Admin privileges required" });
        }

        const result = await pool.query(
          `UPDATE pickups SET feedback = $1 WHERE id = $2 RETURNING *`,
          [feedback, id]
        );

        return res.status(200).json({
          ...result.rows[0],
        });
      }

      const fields = [];
      const params = [];

      if (status) {
        fields.push(`status = $${params.length + 1}`);
        params.push(status);
      }
      if (typeof collectorName !== "undefined") {
        fields.push(`collector_name = $${params.length + 1}`);
        params.push(collectorName || null);
      }
      if (typeof collectorEmail !== "undefined") {
        fields.push(`collector_email = $${params.length + 1}`);
        params.push(collectorEmail || null);
      }
      if (typeof eta !== "undefined") {
        fields.push(`eta = $${params.length + 1}`);
        params.push(eta || null);
      }
      if (typeof lastKnownLocation !== "undefined") {
        fields.push(`last_known_location = $${params.length + 1}`);
        params.push(lastKnownLocation || null);
      }

      if (fields.length === 0) {
        return res.status(400).json({
          error: "No valid fields provided for update",
        });
      }

      params.push(id);
      const result = await pool.query(
        `UPDATE pickups SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );

      const pickup = result.rows[0];
      const userMessage = getStatusMessage(pickup, status);
      const adminMessage = `${pickup.name}'s pickup status changed to ${status}`;

      await pool.query(
        `INSERT INTO admin_notifications (pickup_id, message) VALUES ($1, $2)`,
        [pickup.id, adminMessage]
      );

      if (pickupRow.user_id) {
        await pool.query(
          `INSERT INTO user_notifications (user_id, pickup_id, message) VALUES ($1, $2, $3)`,
          [pickupRow.user_id, pickup.id, userMessage]
        );
      }

      const recipientEmail = pickupRow.user_email || null;

      if (recipientEmail) {
        sendEmail({
          to: recipientEmail,
          ...buildPickupEmail({
            name: pickup.name,
            wasteType: pickup.waste_type,
            quantity: pickup.quantity,
            location: pickup.location,
            status,
            collectorName: pickup.collector_name,
            eta: pickup.eta,
            lastKnownLocation: pickup.last_known_location,
          }),
        }).catch((err) => console.error("Pickup status email failed:", err));
      }

      if (collectorEmail && status === "Assigned") {
        sendEmail({
          to: collectorEmail,
          ...buildCollectorEmail({ collectorName: collectorName || "Collector", pickup, eta }),
        }).catch((err) => console.error("Collector assignment email failed:", err));
      }

      return res.status(200).json({
        ...pickup,
      });
    }

    if (req.method === "DELETE") {
      if (!currentUser.isAdmin) {
        return res.status(403).json({ error: "Admin privileges required" });
      }

      const { id } = req.body;
      await pool.query("DELETE FROM pickups WHERE id = $1", [id]);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports.default = module.exports;
