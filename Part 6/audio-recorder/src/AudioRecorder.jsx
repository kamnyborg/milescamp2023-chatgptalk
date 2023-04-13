import { useState, useRef, useCallback } from "react";
import Say from 'react-say';

const mimeType = "audio/mpeg";

const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audio, setAudio] = useState(null);
    const [text, setText] = useState("");
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
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudio(audioUrl);
            setAudioBlob(audioBlob);
            setAudioChunks([]);
        };
    };

    const transcribeAudio = () => {
        const formData = new FormData();
        formData.append('file', audioBlob);

        fetch('https://localhost:7026/api/audio', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                setText(data);
            })
            .catch(error => {
                // handle any errors here
                console.error(error);
            });
    };

    const answerQuestion = () => {
        fetch('https://localhost:7026/api/message?message=' + text, {
            method: 'POST',
        })
            .then(response => response.text())
            .then(data => {
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
                    {audio ? (
                        <>
                            <div className="audio-container">
                                <audio src={audio} controls></audio>
                            </div>
                            <div className="transcribe-container">
                                <button onClick={transcribeAudio}>Transcribe</button>
                                Result: "{text}"
                            </div>
                            <div className="answer-container">
                                <button onClick={answerQuestion}>Answer</button>
                                Result: "{answer}"
                            </div>
                            {answer &&  <Say text={answer}    />}
                        </>
                    ) : null}
                </div>
            </main>
        </div>
    );
};
export default AudioRecorder;