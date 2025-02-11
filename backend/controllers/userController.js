// controllers/UserController.js
import { UserSchema } from "../models/user.js";
// Controller to get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserSchema.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users", details: err });
    }
};

// Controller for pagination (Optional)
export const getUsersWithPagination = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const users = await UserSchema.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users", details: err });
    }
};

export const updateUser = async (req, res) => {
    const { _id, name, phone, collegeName, course } = req.body;
  
    // Find the user by ID and update only specific fields
    try {
      const updatedUser = await UserSchema.findByIdAndUpdate(
        _id, // Find the user by _id
        {
          $set: {
            name,          // Update the name
            phone,         // Update the phone
            collegeName,   // Update the college name
            course         // Update the course
          }
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(updatedUser); // Send back the updated user data
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Failed to update user", details: err });
    }
  };