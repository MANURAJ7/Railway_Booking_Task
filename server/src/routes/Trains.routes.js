import { Router } from "express";

import { TrainSearch as TrainSearchController } from "../controllers/Trains/TrainsSearch.contollers.js";
import { CreateJourney as CreateJourneyController } from "../controllers/Trains/CreateJourney.controllers.js";
import { verifyJwt as AuthMiddleware } from "../middlewares/Auth.middlewares.js";

const router = Router();

router.route("/search").get(AuthMiddleware, TrainSearchController);
router.route("/newJourney").post(AuthMiddleware, CreateJourneyController);

export default router;
