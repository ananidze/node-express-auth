const jwt = require("jsonwebtoken");

module.exports = function generateJWTTokens(user) {
  const accessToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: "1h",
    }
  );
  const refreshToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};