async function adminLogin({ user_name, password, pool }) {
  const adminVerifyQuery = `
    SELECT * FROM admin_keys WHERE name = $1
  `;
  const adminResult = await pool.query(adminVerifyQuery, [password]);

  if (adminResult.rows.length === 0) return false;
  else return true;
}

module.exports = adminLogin;
