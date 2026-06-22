// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Try to get token from cookie first (httpOnly cookie)
  let token = req.cookies?.token;
  
  // Fallback to Authorization header for backward compatibility (if needed)
  if (!token) {
    token = req.headers["authorization"]?.split(" ")[1];
  }
  
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now req.user will have { id, email, name, etc. }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
