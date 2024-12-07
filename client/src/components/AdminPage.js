import React, { useState } from "react";
import axios from "axios";

const AdminPage = () => {
  const [trainName, setTrainName] = useState("");
  const [startDay, setStartDay] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [coaches, setCoaches] = useState([{ name: "", seats: "" }]);

  const handleCoachChange = (index, field, value) => {
    const newCoaches = [...coaches];
    newCoaches[index][field] = value;
    setCoaches(newCoaches);
  };

  const addCoach = () => {
    setCoaches([...coaches, { name: "", seats: "" }]);
  };

  const removeCoach = (index) => {
    const newCoaches = [...coaches];
    newCoaches.splice(index, 1);
    setCoaches(newCoaches);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trainData = {
      train_name: trainName,
      start_day: startDay,
      source,
      destination,
      coaches,
    };

    const response = await axios.post("http://localhost:3001/newTrain", {
      trainData,
      token: localStorage.getItem("token"),
    });
    alert(
      response.data.message,
      response.status === 201 ? response.data.train_id : ""
    );

    console.log("Train Data:", trainData);
  };

  return (
    <div className="container">
      <h2>Create Train</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="train_name">Train Name</label>
          <input
            type="text"
            id="train_name"
            name="train_name"
            value={trainName}
            onChange={(e) => setTrainName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="start_day">Start Day (Date and Month)</label>
          <input
            type="date"
            id="start_day"
            name="start_day"
            value={startDay}
            onChange={(e) => setStartDay(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="source">Source</label>
          <input
            type="text"
            id="source"
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Coaches</label>
          {coaches.map((coach, index) => (
            <div className="coaches" key={index}>
              <div>
                <label htmlFor={`coach_name_${index}`}>Coach Name</label>
                <input
                  type="text"
                  id={`coach_name_${index}`}
                  value={coach.name}
                  onChange={(e) =>
                    handleCoachChange(index, "name", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor={`available_seats_${index}`}>Seats</label>
                <input
                  type="number"
                  id={`available_seats_${index}`}
                  value={coach.seats}
                  onChange={(e) =>
                    handleCoachChange(index, "seats", e.target.value)
                  }
                  required
                />
              </div>
              <button type="button" onClick={() => removeCoach(index)}>
                Remove Coach
              </button>
            </div>
          ))}
          <button type="button" onClick={addCoach}>
            Add Coach
          </button>
        </div>
        <button type="submit" className="btn">
          Create Train
        </button>
      </form>
    </div>
  );
};

export default AdminPage;
