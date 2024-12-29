import React, { useState, useRef } from "react";
import "../styles/NextPage.css";
import axios from "axios";

const NextPage = () => {
  const [textB, setTextB] = useState({});
  const [isTranscribing, setIsTranscribing] = useState({});

  const handleTextBox = async (index, audioFilePath) => {
    if (!isTranscribing[index]) {
      setIsTranscribing((prevState) => ({ ...prevState, [index]: true }));

      try {
        const response = await axios.post("http://localhost:8000/api/transcribe", {
          audioFilePath: audioFilePath,
          language: "en-US",
        });

        if (response.data.transcription) {
          setTextB((prevState) => ({
            ...prevState,
            [index]: response.data.transcription,
          }));
        }
      } catch (error) {
        console.error("Error during transcription:", error);
      } finally {
        setIsTranscribing((prevState) => ({ ...prevState, [index]: false }));
      }
    }
  };

  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadState, setUploadStatus] = useState("select");
  const [showUploader, setShowUploader] = useState(false);
  const [processedAudios, setProcessedAudios] = useState([]);
  const [originalAudioId, setOriginalAudioId] = useState(null);
  const [showClearDivide, setShowClearDivide] = useState(false);
  const [showProcessedAudios, setShowProcessedAudios] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setProgress(0);
    setUploadStatus("select");
    setProcessedAudios([]);
    setOriginalAudioId(null);
    setShowClearDivide(false);
    setShowProcessedAudios(false);
  };

  const handleUpload = async () => {
    if (uploadState === "done") {
      clearFileInput();
      return;
    }

    try {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await axios.post("http://localhost:8000/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentageCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentageCompleted);
        },
      });
      setUploadStatus("done");
      setOriginalAudioId(response.data.originalAudio._id);
      setProcessedAudios(response.data.processedAudios);
      setShowClearDivide(true);
    } catch (error) {
      console.error("Error during upload:", error);
      setUploadStatus("select");
    }
  };

  const handleDivide = () => {
    setShowProcessedAudios(true);
  };

  return (
    <div className="container">
      {!showUploader ? (
        <div className="intro-screen">
          <h1>Welcome to Audionics</h1>
          <p>Your gateway to advanced audio processing.</p>
          <button className="get-started-btn" onClick={() => setShowUploader(true)}>
            Get Started
          </button>
        </div>
      ) : (
        <div className="fileclass">
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {!selectedFile && (
            <button className="file-btn" onClick={onChooseFile}>
              <span className="material-symbols-outlined">upload</span>Upload File
            </button>
          )}
          {selectedFile && (
            <>
              <div className="file-card">
                <span className="material-symbols-outlined icon">audiotrack</span>
                <div className="file-info">
                  <div style={{ flex: 1 }}>
                    <h6>{selectedFile.name}</h6>
                    <div className="progress-bg">
                      <div className="progress" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  {uploadState === "select" ? (
                    <button onClick={clearFileInput}>
                      <span className="material-symbols-outlined close-icon">close</span>
                    </button>
                  ) : (
                    <div className="check-circle">
                      {uploadState === "uploading"
                        ? `${progress}%`
                        : uploadState === "done" && (
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                              check
                            </span>
                          )}
                    </div>
                  )}
                </div>
              </div>
              {uploadState === "select" && (
                <button className="upload-btn" onClick={handleUpload}>
                  Upload
                </button>
              )}
              {uploadState === "done" && showClearDivide && (
                <div className="button-container">
                  <button className="clear-btn" onClick={clearFileInput}>Clear</button>
                  <button className="divide-btn" onClick={handleDivide}>Divide</button>
                </div>
              )}
            </>
          )}
          {processedAudios.length > 0 && showProcessedAudios && (
            <div className="processed-audios">
              <h2>Processed Audios</h2>
              <ul>
                {processedAudios.map((audio, index) => (
                  <div className="each-audio" key={index}>
                    <li className="audio-item">
                      Audio {index + 1}:
                      <div className="audio-player">
                        <audio
                          controls
                          onError={(e) => console.error("Error loading audio file", e)}
                        >
                          <source
                            src={`http://localhost:8000/uploads/${audio.filePath}`}
                            type="audio/mpeg"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                      <div
                        className="text-button"
                        onClick={() => handleTextBox(index, audio.filePath)}
                      >
                        T
                      </div>
                    </li>

                    <div className={`text-box ${textB[index] ? "open" : ""}`}>
                      {textB[index] && (
                        <>
                          {textB[index]
                            .split(" ")
                            .map((word, wordIndex) => (
                              <span
                                key={wordIndex}
                                className="animated-word"
                                style={{ animationDelay: `${wordIndex * 0.2}s` }}
                              >
                                {word}
                              </span>
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NextPage;
