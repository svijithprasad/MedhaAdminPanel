import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/login";
import AdminPanel from "./AdminPanel";
import ProtectedRoute from "./ProtectedRoute";


const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/panel" element={<AdminPanel />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
