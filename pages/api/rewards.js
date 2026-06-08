const jwt = require("jsonwebtoken");
const pool = require("../../lib/postgres");

const POINTS_PER_COMPLETED_PICKUP = 10;
const REWARD_COST = 100;
const REWARD_NAME = "Sesa Bin Recycling Reward";

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

async function getRewardSummary(userId) {
  const pickupResult = await pool.query(
    `
    SELECT
      COUNT(*) AS total_pickups,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_pickups
    FROM pickups
    WHERE user_id = $1
    `,
    [userId]
  );

  const redemptionResult = await pool.query(
    `
    SELECT COALESCE(SUM(points_spent), 0) AS points_spent
    FROM reward_redemptions
    WHERE user_id = $1
    `,
    [userId]
  );

  const row = pickupResult.rows[0] || {};
  const completedPickups = Number(row.completed_pickups || 0);
  const totalPickups = Number(row.total_pickups || 0);
  const pointsEarned = completedPickups * POINTS_PER_COMPLETED_PICKUP;
  const pointsSpent = Number(redemptionResult.rows[0]?.points_spent || 0);
  const pointsAvailable = Math.max(pointsEarned - pointsSpent, 0);

  return {
    totalPickups,
    completedPickups,
    pendingPickups: Math.max(totalPickups - completedPickups, 0),
    pointsPerCompletedPickup: POINTS_PER_COMPLETED_PICKUP,
    pointsEarned,
    pointsSpent,
    pointsAvailable,
    rewardCost: REWARD_COST,
    rewardName: REWARD_NAME,
    redeemable: pointsAvailable >= REWARD_COST,
    pointsToNextReward: Math.max(REWARD_COST - pointsAvailable, 0),
  };
}

module.exports = async function handler(req, res) {
  try {
    const user = authenticate(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const summary = await getRewardSummary(user.id);
      return res.status(200).json({ success: true, rewards: summary });
    }

    if (req.method === "POST") {
      const summary = await getRewardSummary(user.id);

      if (!summary.redeemable) {
        return res.status(400).json({
          error: `You need ${summary.pointsToNextReward} more points to redeem this reward`,
          rewards: summary,
        });
      }

      const redemption = await pool.query(
        `
        INSERT INTO reward_redemptions (user_id, reward_name, points_spent)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [user.id, REWARD_NAME, REWARD_COST]
      );

      const updatedSummary = await getRewardSummary(user.id);

      return res.status(201).json({
        success: true,
        message: "Reward redeemed successfully",
        redemption: redemption.rows[0],
        rewards: updatedSummary,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports.default = module.exports;
