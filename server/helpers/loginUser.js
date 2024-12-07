const adminLogin = require("./adminLogin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function loginUser({ req, res, pool }) {
  try {
    const { user_name, password } = req.body;
    if (user_name == "admin") {
      if (!adminLogin({ user_name, password, pool })) {
        return res.status(403).json({
          message: "Unauthorized. Invalid admin API key.",
        });
      }
      const token = jwt.sign({ user_id: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        token,
        user: {
          id: "admin",
          username: "admin",
          isAdmin: true,
        },
      });
    } else {
      const userQuery = "SELECT * FROM users WHERE user_name = $1";
      const result = await pool.query(userQuery, [user_name]);

      if (result.rows.length === 0) {
        return res.status(400).json({ message: "Invalid user name" });
      }

      const user = result.rows[0];
      console.log(user);

      const isMatch = await bcrypt.compare(password, user.password);
      console.log(password, user.password, isMatch);
      if (password != user.password) {
        return res.status(400).json({ message: "Invalid Password" });
      }
      const token = jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      console.log("token", token);

      res.json({
        token,
        user: {
          id: user.user_id,
          username: user.username,
          isAdmin: false,
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
}
module.exports = loginUser;
