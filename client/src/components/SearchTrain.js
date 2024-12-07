import { useState, useEffect } from "react";
import axios from "axios";

const SearchTrain = ({ socket, user }) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [availableTrains, setAvailableTrains] = useState([]); // Keep as array
  const [seatsToBook, setSeatsToBook] = useState({});

  useEffect(() => {
    if (!socket) return;

    socket.on("seatUpdates", (updates) => {
      console.log("New updates: ", updates);

      setAvailableTrains((prevTrains) =>
        prevTrains.map((train) => {
          if (updates[train.train_id]) {
            const updatedCoaches = { ...train.coaches };
            for (const coach in updates[train.train_id]) {
              updatedCoaches[coach] = Math.max(
                (updatedCoaches[coach] || 0) - updates[train.train_id][coach],
                0
              );
            }
            return { ...train, coaches: updatedCoaches };
          }
          return train;
        })
      );
    });

    return () => {
      socket.off("seatUpdates");
    };
  }, [socket]);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const setData = {
        source,
        destination,
      };
      const response = await axios.post("http://localhost:3001/getTrainData", {
        setData,
        token: localStorage.getItem("token"),
      });
      console.log("trains: ", response.data.trains);

      if (response.data) {
        setAvailableTrains(response.data.trains);
        availableTrains.map((train) => {
          socket.emit("joinRoom", train.train_id);
        });
      }
    } catch (error) {
      console.error("Error fetching train data:", error);
    }
  };

  const handleBookSeats = async (trainId, coachName) => {
    const token = localStorage.getItem("token");
    const numberOfSeats = seatsToBook[`${trainId}-${coachName}`] || 0;

    if (!numberOfSeats || numberOfSeats <= 0) {
      alert("Please enter a valid number of seats to book.");
      return;
    }

    const train = availableTrains.find((t) => t.train_id === trainId);
    const availableSeats = train?.coaches[coachName] || 0;

    if (availableSeats < numberOfSeats) {
      alert(
        `Not enough seats available in train ${trainId}, coach ${coachName}.`
      );
      return;
    }

    const trainData = {
      train_id: trainId,
      coach_name: coachName,
      number_of_seats: numberOfSeats,
    };

    try {
      const response = await axios.post("http://localhost:3001/bookSeats", {
        trainData,
        token,
      });

      if (response.data) {
        alert(
          `Successfully booked ${numberOfSeats} seats in coach ${coachName}. Allocated seats: ${response.data.allocatedSeats.join(
            ", "
          )}.`
        );

        setSeatsToBook((prevSeats) => ({
          ...prevSeats,
          [`${trainId}-${coachName}`]: "",
        }));
        socket.emit("updates", trainData);
      }
    } catch (error) {
      console.error("Error booking seats:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <label>
          Source:
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Destination:
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Search Train</button>
      </form>

      <h3>Available Trains:</h3>
      {availableTrains.map((train) => (
        <div key={train.train_id}>
          <h4>Train ID: {train.train_id}</h4>
          {Object.entries(train.coaches).map(([coachName, availableSeats]) => (
            <div key={`${train.train_id}-${coachName}`}>
              <p>
                Coach {coachName}: {availableSeats} seats available
              </p>
              <input
                type="number"
                placeholder="Seats to book"
                value={seatsToBook[`${train.train_id}-${coachName}`] || ""}
                onChange={(e) =>
                  setSeatsToBook((prev) => ({
                    ...prev,
                    [`${train.train_id}-${coachName}`]: parseInt(
                      e.target.value,
                      10
                    ),
                  }))
                }
              />
              <button
                onClick={() => handleBookSeats(train.train_id, coachName)}
              >
                Book Seats
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SearchTrain;
