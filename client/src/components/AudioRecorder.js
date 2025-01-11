import React, { useState } from "react";
import { ReactMic } from "react-mic";

const AudioRecorder = ({ onStopRecording }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleStartRecording = () => {
    setRecording(true);
  };

  const handleStopRecording = () => {
    setRecording(false);
  };

  const handleData = (recordedBlob) => {
    console.log(recordedBlob);
    setAudioBlob(recordedBlob); // Gelen veriyi doğrudan kaydediyoruz
  };

  const handleSaveRecording = () => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob.blob, "user_audio.wav"); // Burada blob verisini gönderiyoruz

      fetch("http://localhost:5000/train", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => alert("Model eğitildi!"))
        .catch((error) => console.error("Error:", error));
    } catch (error) {
      console.log(error);
    }
  };

  // 'onStopRecording' ile ses kaydını üst bileşene gönderiyoruz
  React.useEffect(() => {
    if (audioBlob) {
      onStopRecording(audioBlob); // Prop üzerinden data gönderiyoruz
    }
  }, [audioBlob, onStopRecording]);

  return (
    <div>
      <button onClick={handleStartRecording} disabled={recording}>
        Kayda Başla
      </button>
      <button onClick={handleStopRecording} disabled={!recording}>
        Kaydı Durdur
      </button>
      <button onClick={handleSaveRecording} disabled={!audioBlob}>
        Modeli Eğit
      </button>

      <ReactMic
        record={recording}
        className="sound-wave"
        onStop={handleStopRecording}
        onData={handleData}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
    </div>
  );
};

export default AudioRecorder;
