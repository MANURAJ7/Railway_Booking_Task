const jwt = require("jsonwebtoken");

async function bookSeats({ req, res, pool }) {
  const { train_id, coach_name, number_of_seats } = req.body.trainData;

  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE"); // to handle multiple user seat bookings

      const checkAvailabilityQuery = `
                SELECT c.id AS coach_id, c.available_seats, t.source, t.destination
                FROM coaches c
                JOIN trains t ON c.train_id = t.id
                WHERE t.id = $1 AND c.coach_name = $2 AND c.available_seats >= $3
            `;
      const availabilityResult = await client.query(checkAvailabilityQuery, [
        train_id,
        coach_name,
        number_of_seats,
      ]);

      if (availabilityResult.rows.length === 0) {
        throw new Error("Insufficient seats or invalid train/coach");
      }

      const { coach_id, source, destination } = availabilityResult.rows[0];

      // Create a booking record
      const bookingQuery = `
                INSERT INTO bookings 
                (user_id, train_id, source, destination, coach, number_of_seats) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING id
            `;
      const bookingResult = await client.query(bookingQuery, [
        user_id,
        train_id,
        source,
        destination,
        coach_name,
        number_of_seats,
      ]);
      const bookingId = bookingResult.rows[0].id;

      // Allocate seats
      const allocateSeatQuery = `
                SELECT seat_number 
                FROM seats 
                WHERE train_id = $1 
                AND coach_name = $2 
                AND booking_id is NULL 
                LIMIT $3
            `;
      const seatsResult = await client.query(allocateSeatQuery, [
        train_id,
        coach_name,
        number_of_seats,
      ]);

      if (seatsResult.rows.length < number_of_seats) {
        throw new Error("Not enough available seats");
      }

      const allocatedSeats = seatsResult.rows.map((seat) => seat.seat_number);

      const updateSeatQuery = `
                UPDATE seats 
                SET booking_id = $1 
                WHERE train_id = $2 
                AND coach_name = $3 
                AND seat_number = ANY($4)
            `;
      await client.query(updateSeatQuery, [
        bookingId,
        train_id,
        coach_name,
        allocatedSeats,
      ]);

      // Update available seats in coaches
      const updateCoachQuery = `
                UPDATE coaches 
                SET available_seats = available_seats - $1 
                WHERE id = $2
            `;
      await client.query(updateCoachQuery, [number_of_seats, coach_id]);

      // Commit the transaction
      await client.query("COMMIT");

      res.status(201).json({
        message: "Train booked successfully",
        bookingId: bookingId,
        allocatedSeats: allocatedSeats,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Booking error:", error);
      res.status(400).json({ message: error.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = bookSeats;
