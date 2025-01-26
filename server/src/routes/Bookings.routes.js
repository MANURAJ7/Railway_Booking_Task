import { Router } from "express";

import { Booking as BookingController } from "../controllers/Bookings/Booking.controllers.js";
import { UserBookings as UserBookingsController } from "../controllers/Bookings/UserBookings.controllers.js";
import { verifyJwt as AuthMiddleware } from "../middlewares/Auth.middlewares.js";
const router = Router();

router.route("/Book").post(AuthMiddleware, BookingController);
router.route("/UserBookings").get(AuthMiddleware, UserBookingsController);

export default router;
