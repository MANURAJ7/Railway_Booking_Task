import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { pool } from "../../db/postgres/index.js";

const Booking = asyncHandler(async (req, res) => {
  const { trainId, coachName, numberOfSeats } = req.body.trainData;
  const userId = req.userId;
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
      trainId,
      coachName,
      numberOfSeats,
    ]);

    if (availabilityResult.rows.length === 0) {
      throw new ApiError(409, "Insufficient seats");
    }

    const { coachId, source, destination } = availabilityResult.rows[0];

    // Create a booking record
    const bookingQuery = `
                INSERT INTO bookings 
                (user_id, train_id, source, destination, coach, number_of_seats) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING id
            `;
    const bookingResult = await client.query(bookingQuery, [
      userId,
      trainId,
      source,
      destination,
      coachName,
      numberOfSeats,
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
      trainId,
      coachName,
      numberOfSeats,
    ]);

    if (seatsResult.rows.length < numberOfSeats) {
      throw new ApiError(409, "Insufficient seats");
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
      trainId,
      coachName,
      allocatedSeats,
    ]);

    // Update available seats in coaches
    const updateCoachQuery = `
        UPDATE coaches 
        SET available_seats = available_seats - $1 
        WHERE id = $2
    `;
    await client.query(updateCoachQuery, [numberOfSeats, coachId]);

    // Commit the transaction
    await client.query("COMMIT");

    res.status(201).json(
      new ApiResponse(201, "Train booked successfully", {
        bookingId: bookingId,
        allocatedSeats: allocatedSeats,
      })
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Booking error:", err);
    res.status(400).json(new ApiError(err.status || 400, err.message));
  } finally {
    client.release();
  }
});

export { Booking };
