const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const token = req.get('Authorization').split(' ')[1];
    if (!token) {
      res.json({ message: "Token Not Exists", expired: true });
      next();
    }
    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN)
    req.user = decodedData
    
    next();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};