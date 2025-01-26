import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { pool } from "../../db/postgres/index.js";

const UserBookings = asyncHandler(async (req, res) => {
  const userId = req.userId;
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

  const userBookings = await pool.query(userBookingsQuery, [userId]);
  return res.status(200).json(new ApiResponse(200, "", userBookings.rows));
});

export { UserBookings };
