import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { pool } from "../../db/postgres/index.js";
import bcrypt from "bcryptjs";

export const RegisterUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const userQuery = "SELECT * FROM users WHERE email = $1";
  const existingUser = await pool.query(userQuery, [email]);

  if (existingUser.rows.length > 0) {
    throw new ApiError(400, "User already exists");
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const insertQuery = `
        INSERT INTO users (username, email, password, is_active) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, username, email
      `;

  const values = [userName, email, hashedPassword, true];
  const result = await pool.query(insertQuery, values);

  res.status(201).json(new ApiResponse(201, result.rows[0]));
});
export { RegisterUser };
