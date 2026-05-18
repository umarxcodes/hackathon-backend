import express from "express";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";
import {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getDoctors,
} from "../controllers/userController.js";

const router = express.Router();
router.use(auth);
router.get("/", roleCheck("admin"), getUsers);
router.post("/", roleCheck("admin"), createUser);
router.get("/doctors", roleCheck("admin", "receptionist"), getDoctors);
router.get("/:id", roleCheck("admin"), getUser);
router.put("/:id", roleCheck("admin"), updateUser);
router.delete("/:id", roleCheck("admin"), deleteUser);

export default router;
