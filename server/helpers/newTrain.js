const jwt = require("jsonwebtoken");

async function newTrain({ req, res, pool }) {
  try {
    const { train_name, start_day, source, destination, coaches } =
      req.body.trainData;
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    if (decoded.user_id != "admin") {
      return res.status(403).json({
        message: "Unauthorized. Invalid admin API key.",
      });
    }
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const trainQuery = `
          INSERT INTO trains 
          (train_name, start_time, source, destination) 
        VALUES ($1, $2, $3, $4) RETURNING id`;

      const trainResult = await client.query(trainQuery, [
        train_name,
        start_day,
        source,
        destination,
      ]);
      const trainId = trainResult.rows[0].id;
      console.log("line here", trainResult.rows[0]);

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

      res.status(201).json({
        message: "Train created successfully",
        trainId: trainId,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating train:", error);
    res.status(500).json({ message: "Server error during train creation" });
  }
}

module.exports = newTrain;
