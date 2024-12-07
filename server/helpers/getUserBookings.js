const jwt = require("jsonwebtoken");
const pool = require("../server");
const JWT_SECRET = "your-secret-key-here";

async function getUserBookings({ req, res, pool }) {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user_id = decoded.user_id;

    const client = await pool.connect();

    try {
      const userBookingsQuery = `
        SELECT 
          b.train_id, 
          b.source, 
          b.destination, 
          b.coach, 
          b.number_of_seats 
        FROM 
          bookings b
        WHERE 
          b.user_id = $1
      `;

      const bookingsResult = await client.query(userBookingsQuery, [user_id]);

      if (bookingsResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No bookings found for this user." });
      }

      res.status(200).json({
        user_id: user_id,
        bookings: bookingsResult.rows,
      });
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = getUserBookings;
