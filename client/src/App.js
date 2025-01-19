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
  // Durum yönetimi
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Bileşen yüklendiğinde kullanıcıları getir
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Kullanıcılar getirilirken hata:", error);
      showError("Kullanıcılar getirilemedi. Lütfen daha sonra tekrar deneyin.");
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getResultColor = () => {
    if (predictionResult === true) return "#4caf50"; // Başarılı için yeşil
    if (predictionResult === false) return "#f44336"; // Başarısız için kırmızı
    return "inherit";
  };

  // Dosya işleme fonksiyonları
  const handleFile = (file) => {
    if (file && file.type === "audio/wav") {
      setFile(file);
      setMessage("");
    } else {
      showError("Lütfen .wav dosyası yükleyin");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Sürükle ve bırak işleyicileri
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

  // Form gönderme işleyicileri
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
      console.error("Model eğitilirken hata:", error);
      showError("Model eğitilemedi. Lütfen tekrar deneyin.");
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
        showSuccess("Ses eşleşmesi onaylandı! ✓");
      } else {
        showError("Ses eşleşmesi başarısız ✗");
      }
    } catch (error) {
      console.error("Tahmin yapılırken hata:", error);
      showError("Ses tahmini yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Yardımcı fonksiyonlar
  const validateForm = () => {
    if (!userName) {
      showError("Lütfen adınızı girin");
      return false;
    }
    if (!file) {
      showError("Lütfen bir dosya seçin");
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
          Ses Tanıma
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Kolayca model eğitin ve ses tahmini yapın
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
          <Tab label="Model Eğit" icon={<Mic />} />
          <Tab label="Ses Tahmin Et" icon={<Upload />} />
        </Tabs>

        <form
          onSubmit={activeTab === 0 ? handleTrainSubmit : handlePredictSubmit}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {activeTab === 0 ? (
              <TextField
                fullWidth
                label="Adınızı girin"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                variant="outlined"
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel>Kullanıcı Seçin</InputLabel>
                <Select
                  value={userName}
                  label="Kullanıcı Seçin"
                  onChange={(e) => setUserName(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
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
                    : ".wav dosyanızı buraya sürükleyin veya seçmek için tıklayın"}
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
                "Model Eğit"
              ) : (
                "Ses Tahmin Et"
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