import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { toast } from "sonner";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_ENDPOINT}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        navigate("/panel");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#121212",
          padding: "2rem",
          borderRadius: "10px",
          color: "white",
          boxShadow: "0 4px 10px rgba(255, 255, 255, 0.2)",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: "1rem" }}>
          Admin Login
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          name="username"
          onChange={handleChange}
          fullWidth
          sx={{ input: { color: "white" }, marginBottom: "1rem", backgroundColor: "#333" }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          name="password"
          onChange={handleChange}
          fullWidth
          sx={{ input: { color: "white" }, marginBottom: "1rem", backgroundColor: "#333" }}
        />
        <Button variant="contained" onClick={handleLogin} fullWidth sx={{ backgroundColor: "#fff", color: "#000" }}>
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
