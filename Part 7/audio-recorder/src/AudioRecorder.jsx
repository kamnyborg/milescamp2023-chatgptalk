import { useState, useRef } from "react";
import Say from 'react-say';

const mimeType = "audio/mpeg";

const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [answer, setAnswer] = useState("");

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

    const startRecording = async () => {
        setRecordingStatus("recording");
        const media = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            setAudioChunks([]);
            transcribeAudio(audioBlob);
        };
    };

    const transcribeAudio = (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob);

        fetch('https://localhost:7026/api/audio', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                setAnswer(undefined);
                console.log('YOU: ' + data);

                if (!data) {
                    return;
                }

                answerQuestion(data);
            })
            .catch(error => {
                // handle any errors here
                console.error(error);
            });
    };

    const answerQuestion = (message) => {
        fetch('https://localhost:7026/api/message?message=' + message, {
            method: 'POST',
        })
            .then(response => response.text())
            .then(data => {
                console.log("CHATGPT: " + data);
                setAnswer(data);
            })
            .catch(error => {
                // handle any errors here
                console.error(error);
            });
    };

    return (
        <div>
            <main>
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
                    {answer && <Say text={answer} />}
                </div>
            </main>
        </div>
    );
};
export default AudioRecorder;