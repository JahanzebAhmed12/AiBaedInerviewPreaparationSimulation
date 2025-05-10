
// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now(); // token expired?
    return isExpired ? <Navigate to="/login" /> : children;
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
