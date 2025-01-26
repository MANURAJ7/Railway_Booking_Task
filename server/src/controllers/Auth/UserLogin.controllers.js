import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { pool } from "../../db/postgres/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const LoginUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;

  const userQuery = "SELECT * FROM users WHERE user_name = $1";
  const user = await pool.query(userQuery, [userName]);
  if (user.rows.length === 0) {
    throw new ApiError(401, "Invalid user name");
  }
  user = user.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid Password");
  }
  const accessToken = jwt.sign(
    { userId: user.user_id },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
  res.status(200).json(
    new ApiResponse(200, {
      token: accessToken,
      user: {
        id: user.user_id,
        username: user.username,
        isAdmin: false,
      },
    })
  );
});
export { LoginUser };
