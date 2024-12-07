import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found, go back to Login");
      navigate("/Login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001//getUserBookings",
          {
            token,
          }
        );

        setBookings(response.data.bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        if (err.response?.status === 401) {
          navigate("/Login");
        }
      }
    };

    fetchBookings();
  }, [navigate]);

  return (
    <div>
      <h1>Your Bookings</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {bookings.length === 0 && !error ? (
        <p>No bookings found.</p>
      ) : (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Train ID</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Coach</th>
              <th>Seats</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index}>
                <td>{booking.train_id}</td>
                <td>{booking.source}</td>
                <td>{booking.destination}</td>
                <td>{booking.coach}</td>
                <td>{booking.number_of_seats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingsPage;
