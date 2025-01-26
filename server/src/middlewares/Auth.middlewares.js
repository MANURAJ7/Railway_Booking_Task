import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.body.token;

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json(new ApiError(401, "Unauthorized"));
    req.userId = decoded.userId || decoded;
    next();
  });
});

export { verifyJwt };
