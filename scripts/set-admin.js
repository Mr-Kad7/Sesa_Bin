const pool = require("../lib/postgres");

async function setAdmin() {
  try {
    const result = await pool.query(
      "UPDATE users SET is_admin = true WHERE email = $1 RETURNING *",
      ["dennisappiahkubi888@gmail.com"]
    );

    if (result.rows.length === 0) {
      console.log("❌ User not found with that email.");
      process.exit(1);
    }

    console.log("✅ Admin privileges granted to:", result.rows[0].email);
    console.log("Please log out and log back in to refresh your session.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

setAdmin();
