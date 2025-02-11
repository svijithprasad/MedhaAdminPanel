import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
import router from './routes/userRoutes.js';


configDotenv(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/api", router);


