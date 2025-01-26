import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { pool } from "../../db/postgres/index.js";

const LoginAdmin = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  const adminQuery = `
      SELECT * FROM admin_keys WHERE name = $1
    `;
  const admin = await pool.query(adminQuery, [userName]);

  if (admin.rows.length === 0) throw new ApiError(401, "Incorrect user name");
  admin = admin.rows[0];
  if (admin.password != password) throw new ApiError(401, "Incorrect password");

  const accessToken = jwt.sign({ user_id: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(200).json(
    new ApiResponse(200, {
      token: accessToken,
      user: {
        id: "admin",
        username: "admin",
        isAdmin: true,
      },
    })
  );
});

export { LoginAdmin };
