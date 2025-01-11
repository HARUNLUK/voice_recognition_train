import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch the list of registered users
    axios
      .get("http://localhost:5000/users")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !file) {
      alert("Please enter your name and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", userName);

    try {
      const response = await axios.post(
        "http://localhost:5000/train-model",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error training model:", error);
      alert("Error training model.");
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !file) {
      alert("Please select a user and a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", userName);

    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(response.data.prediction);
    } catch (error) {
      console.error("Error predicting:", error);
      alert("Error predicting.");
    }
  };

  return (
    <div>
      <h1>Voice Recognition</h1>

      <h2>Train Model</h2>
      <form onSubmit={handleTrainSubmit}>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input type="file" accept=".wav" onChange={handleFileChange} />
        <button type="submit">Train Model</button>
      </form>

      <h2>Predict Sound</h2>
      <form onSubmit={handlePredictSubmit}>
        <select value={userName} onChange={(e) => setUserName(e.target.value)}>
          <option value="">Select User</option>
          {users.map((user, index) => (
            <option key={index} value={user}>
              {user}
            </option>
          ))}
        </select>
        <input type="file" accept=".wav" onChange={handleFileChange} />
        <button type="submit">Predict</button>
      </form>
    </div>
  );
};

export default App;
