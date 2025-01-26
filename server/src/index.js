import { app } from "./app";
import pool from "./db/postgres/index";
const PORT = "3001";

pool.connect((err) => {
  if (err) {
    console.log("Error from pg pool: ", err);
    // process.exit(1);
  } else {
    console.log("Postgress Connected successfuly");
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  }
});
