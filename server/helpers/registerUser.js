async function registerUser({ req, res, pool }) {
  try {
    const { username, email, password } = req.body;

    const existingUserQuery = "SELECT * FROM users WHERE email = $1";
    const existingUserResult = await pool.query(existingUserQuery, [email]);

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO users (username, email, password, is_active) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, username, email
    `;
    const values = [username, email, hashedPassword, true];
    const result = await pool.query(insertQuery, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
}
module.exports = registerUser;
