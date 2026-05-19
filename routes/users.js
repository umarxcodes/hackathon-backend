import express from "express";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createUserValidation,
  updateUserValidation,
} from "../validations/userValidation.js";
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
router.post("/", roleCheck("admin"), createUserValidation, createUser);
router.get(
  "/doctors",
  roleCheck("admin", "receptionist", "doctor", "patient"),
  getDoctors
);
router.get("/:id", roleCheck("admin"), getUser);
router.put("/:id", roleCheck("admin"), updateUserValidation, updateUser);
router.delete("/:id", roleCheck("admin"), deleteUser);

export default router;
