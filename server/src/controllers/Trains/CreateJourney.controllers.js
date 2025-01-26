import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { pool } from "../../db/postgres/index.js";

const CreateJourney = asyncHandler(async (req, res) => {
  const { trainName, startDay, source, destination, coaches } =
    req.body.trainData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const trainQuery = `
          INSERT INTO trains 
          (train_name, start_time, source, destination) 
        VALUES ($1, $2, $3, $4) RETURNING id`;

    const newTrain = await client.query(trainQuery, [
      trainName,
      startDay,
      source,
      destination,
    ]);
    const trainId = newTrain.rows[0].id;

    // Insert coaches
    for (const coach of coaches) {
      // Insert coach
      const coachQuery = `
                INSERT INTO coaches 
                (train_id, coach_name, available_seats) 
                VALUES ($1, $2, $3) 
                RETURNING id
            `;
      await client.query(coachQuery, [trainId, coach.name, coach.seats]);

      // Generate seats for the coach
      for (let i = 1; i <= coach.seats; i++) {
        const seatQuery = `
                    INSERT INTO seats 
                    (seat_number, train_id, coach_name) 
                    VALUES ($1, $2, $3)
                `;
        await client.query(seatQuery, [
          `${coach.name}${i}`,
          trainId,
          coach.name,
        ]);
      }
    }

    await client.query("COMMIT");

    res
      .status(201)
      .json(new ApiResponse(201, "Train created successfully", trainId));
  } catch (err) {
    await client.query("ROLLBACK");
    throw new ApiError(500, err.message);
  } finally {
    client.release();
  }
});

export { CreateJourney };
