export const checkAdmin = (req, res, next) => {
  console.log("Decoded User:", req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};