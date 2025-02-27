import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "password123", // Change this to a secure password
  };

export const login = (req, res) => {
    const { username, password } = req.body;

    if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
    ) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        return res.json({ token });
    } else {
        return res.status(401).json({ message: "Invalid credentials" });
    }
}

