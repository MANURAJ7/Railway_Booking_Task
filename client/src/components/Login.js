import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAdmin, setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        user_name: username,
        password,
      });
      setUser(response.data.user_id);
      console.log(response.data);
      localStorage.setItem("token", response.data.token);

      if (response.data.user.isAdmin) {
        setIsAdmin(true);
        navigate("/AdminPage");
      } else {
        navigate("/SearchTrain");
      }
    } catch (error) {
      console.log(error);
      alert("Login failed: ", error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
export default Login;
