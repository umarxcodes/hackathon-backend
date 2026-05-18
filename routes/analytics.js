import express from "express";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";
import {
  getAdminAnalytics,
  getDoctorAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();
router.use(auth);
router.get("/admin", roleCheck("admin"), getAdminAnalytics);
router.get("/doctor", roleCheck("doctor"), getDoctorAnalytics);

export default router;
