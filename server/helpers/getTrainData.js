async function getTrainData({ req, res, pool }) {
  try {
    const { source, destination } = req.body.setData;

    if (!source || !destination) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters." });
    }

    const client = await pool.connect();

    try {
      const trainDataQuery = `SELECT 
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

      const trainDataResult = await client.query(trainDataQuery, [
        source,
        destination,
      ]);

      if (trainDataResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No train data found for the given criteria." });
      }

      const trains = [];

      trainDataResult.rows.forEach((row) => {
        let train = trains.find((t) => t.train_id === row.train_id);
        if (!train) {
          train = {
            train_id: row.train_id,
            coaches: {},
          };
          trains.push(train);
        }

        train.coaches[row.coach_name] = row.available_seats;
      });

      console.log(trains);

      res.status(200).json({ trains });
    } catch (error) {
      console.error("Error fetching train data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = getTrainData;
