Scaffold the project with: npm create vite@latest
- Type in a project name (react-recorder)
- Choose React as a framework
- Select the Javascript variant

Install packages and run the server:
cd react-recorder && npm i && npm run dev

The server will start on http://localhost:5173/

Create a file in the src directory named AudioRecorder.jsx, paste the following into it:
import { useState, useRef } from "react";
const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };
    return (
        <div>
            <h2>Audio Recorder</h2>
            <main>
                <div className="audio-controls">
                    {!permission ? (
                        <button onClick={getMicrophonePermission} type="button">
                            Get Microphone
                        </button>
                    ): null}
                    {permission ? (
                        <button type="button">
                            Record
                        </button>
                    ): null}
                </div>
            </main>
        </div>
    );
};
export default AudioRecorder;


Go to App,jsx and replace its contents with the following block of code:
import "./App.css";
import AudioRecorder from "../src/AudioRecorder";

const App = () => {

  return (
    <AudioRecorder />
  );
};
export default App;


Go to AudioRecorder.jsx and add the following outside the component's function scope:
const mimeType = "audio/webm";

Declare the following state vcariables inside the AudioRecorder.jsx component scope:
const [permission, setPermission] = useState(false);
const mediaRecorder = useRef(null);
const [recordingStatus, setRecordingStatus] = useState("inactive");
const [stream, setStream] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);
const [audio, setAudio] = useState(null);

Just after the getMicrophonePermission function, add the following code:
const startRecording = async () => {
  setRecordingStatus("recording");
  //create new Media recorder instance using the stream
  const media = new MediaRecorder(stream, { type: mimeType });
  //set the MediaRecorder instance to the mediaRecorder ref
  mediaRecorder.current = media;
  //invokes the start method to start the recording process
  mediaRecorder.current.start();
  let localAudioChunks = [];
  mediaRecorder.current.ondataavailable = (event) => {
     if (typeof event.data === "undefined") return;
     if (event.data.size === 0) return;
     localAudioChunks.push(event.data);
  };
  setAudioChunks(localAudioChunks);
};

Create a stopRecording function below the startRecording function:
const stopRecording = () => {
  setRecordingStatus("inactive");
  //stops the recording instance
  mediaRecorder.current.stop();
  mediaRecorder.current.onstop = () => {
    //creates a blob file from the audiochunks data
     const audioBlob = new Blob(audioChunks, { type: mimeType });
    //creates a playable URL from the blob file.
     const audioUrl = URL.createObjectURL(audioBlob);
     setAudio(audioUrl);
     setAudioChunks([]);
  };
};

Modify <div className="audio-controls"> to conditionally render the start/stop recording buttons depending on the recordingStatus state:
<div className="audio-controls">
    {!permission ? (
    <button onClick={getMicrophonePermission} type="button">
        Get Microphone
    </button>
    ) : null}
    {permission && recordingStatus === "inactive" ? (
    <button onClick={startRecording} type="button">
        Start Recording
    </button>
    ) : null}
    {recordingStatus === "recording" ? (
    <button onClick={stopRecording} type="button">
        Stop Recording
    </button>
    ) : null}
</div>

Allow playback with the following code:
{audio ? (
  <div className="audio-container">
     <audio src={audio} controls></audio>
     <a download href={audio}>
        Download Recording
     </a>
   </div>
) : null}
