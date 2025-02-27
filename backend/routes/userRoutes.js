// routes/userRoutes.js
import express from "express";
import { getAllUsers, getUsersWithPagination, updateUser } from "../controllers/userController.js";
import { login } from "../controllers/adminController.js";


const router = express.Router();

// Route to fetch all users
router.get("/users", getAllUsers);

// Route to fetch users with pagination (optional)
router.get("/users/paginated", getUsersWithPagination);

router.put("/users/:id", updateUser);

router.post('/login', login)


export default router;
