import { jwtDecode } from "jwt-decode"; // Correct import


export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded Token:", decoded); // Debugging
    return decoded.sub || decoded.user_id; // Ensure the user ID is correctly extracted
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};
