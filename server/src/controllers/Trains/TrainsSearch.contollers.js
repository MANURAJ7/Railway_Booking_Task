import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { pool } from "../../db/postgres/index.js";

const TrainSearch = asyncHandler(async (req, res) => {
  const { source, destination, date } = req.query;
  if (!source || !destination || !date) {
    throw new ApiError(422, "Insufficient data");
  }
  // ToDo: remove source & destination from query response
  const query = `SELECT 
      t.id AS train_id,
      t.source,   
      t.destination, 
      c.coach_name, 
      c.available_seats 
    FROM 
      trains t
    JOIN 
      coaches c 
    ON 
      t.id = c.train_id
    WHERE 
      t.source = $1 AND t.destination = $2`;

  const TrainsData = await pool.query(query, [source, destination]);

  if (TrainsData.rows.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Message: No Trains available"));
  }

  const Trains = [];
  TrainsData.rows.forEach((row) => {
    let train = Trains.find((t) => t.train_id === row.train_id);
    if (!train) {
      train = {
        train_id: row.train_id,
        coaches: {},
      };
      Trains.push(train);
    }
    train.coaches[row.coach_name] = row.available_seats;
  });
  console.log(Trains);
  res.status(200).json(new ApiResponse(200, Trains));
});
export { TrainSearch };
