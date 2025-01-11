import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Box,
  Tab,
  Tabs,
  IconButton,
} from "@mui/material";
import { Mic, Upload } from "lucide-react";

const App = () => {
  // State management
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Fetch users on component mount
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError("Failed to fetch users. Please try again later.");
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getResultColor = () => {
    if (predictionResult === true) return "#4caf50"; // Green for success
    if (predictionResult === false) return "#f44336"; // Red for failure
    return "inherit";
  };

  // File handling functions
  const handleFile = (file) => {
    if (file && file.type === "audio/wav") {
      setFile(file);
      setMessage("");
    } else {
      showError("Please upload a .wav file");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Form submission handlers
  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", userName);

    try {
      const response = await axios.post(
        "http://localhost:5000/train-model",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      showSuccess(response.data.message);
      setUsers((prevUsers) => [...new Set([...prevUsers, userName])]);
      resetForm();
    } catch (error) {
      console.error("Error training model:", error);
      showError("Failed to train model. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setPredictionResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", userName);

    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setPredictionResult(response.data?.prediction);
      if (response.data?.prediction === true) {
        showSuccess("Voice match confirmed! ✓");
      } else {
        showError("Voice does not match ✗");
      }
    } catch (error) {
      console.error("Error predicting:", error);
      showError("Failed to process voice prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const validateForm = () => {
    if (!userName) {
      showError("Please enter your name");
      return false;
    }
    if (!file) {
      showError("Please select a file");
      return false;
    }
    return true;
  };

  const showError = (message) => {
    setMessage({ type: "error", text: message });
  };

  const showSuccess = (message) => {
    setMessage({ type: "success", text: message });
  };

  const resetForm = () => {
    setFile(null);
    if (activeTab === 0) {
      setUserName("");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setMessage("");
    resetForm();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Voice Recognition
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Train models and predict voices with ease
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          border: dragActive ? "2px dashed #1976d2" : "2px dashed #ccc",
          backgroundColor: "#fafafa",
          cursor: "pointer",
          transition: "all 0.3s ease-in-out",
          borderColor:
            predictionResult !== null
              ? getResultColor()
              : dragActive
              ? "#1976d2"
              : "#ccc",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Train Model" icon={<Mic />} />
          <Tab label="Predict Voice" icon={<Upload />} />
        </Tabs>

        <form
          onSubmit={activeTab === 0 ? handleTrainSubmit : handlePredictSubmit}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {activeTab === 0 ? (
              <TextField
                fullWidth
                label="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                variant="outlined"
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={userName}
                  label="Select User"
                  onChange={(e) => setUserName(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {users.map((user, index) => (
                    <MenuItem key={index} value={user}>
                      {user}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                border: dragActive ? "2px dashed #1976d2" : "2px dashed #ccc",
                backgroundColor: "#fafafa",
                cursor: "pointer",
                transition: "border 0.3s ease-in-out",
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              component="label"
            >
              <input
                type="file"
                accept=".wav"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <Box sx={{ textAlign: "center" }}>
                <IconButton size="large" color="primary" component="span">
                  <Upload />
                </IconButton>
                <Typography>
                  {file
                    ? file.name
                    : "Drop your .wav file here or click to browse"}
                </Typography>
              </Box>
            </Paper>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeTab === 0 ? (
                "Train Model"
              ) : (
                "Predict Voice"
              )}
            </Button>

            {message && (
              <Alert severity={message.type === "error" ? "error" : "success"}>
                {message.text}
              </Alert>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default App;
