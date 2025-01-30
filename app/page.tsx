"use client";

import Boulders from "@/components/Boulder";
import CameraFeed from "@/components/CameraFeed";
import StartScreen from "@/components/StartScreen";
import { useState, useEffect, useRef } from "react";
import { getPrediction } from "@/services/inference.service";
import { Prediction } from "@/types/inference.type";
import { GameSettings } from "@/types/settings.type";
import Webcam from "react-webcam";

export default function Home() {
  const webcamRef = useRef<Webcam | null>(null);
  const [handPositions, setHandPositions] = useState<Prediction[]>([]);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!displaySize) return;

    const frameInterval = 1000 / 30; // 30 FPS
    let animationFrameId: number;
    let lastFrameTime = 0;

    const processFrame = async (timestamp: number) => {
      if (timestamp - lastFrameTime >= frameInterval) {
        const base64Frame = getFrameBase64();
        if (base64Frame) {
          const predictions = await getPrediction(base64Frame);
          const scaledPredictions = predictions.map((prediction: Prediction) => ({
            x: (prediction.x * displaySize.width) / 640,
            y: (prediction.y * displaySize.height) / 480,
            width: (prediction.width * displaySize.width) / 640,
            height: (prediction.height * displaySize.height) / 480,
          }));
          setHandPositions(scaledPredictions);
        }
        lastFrameTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [displaySize]);

  const handleStart = (settings: GameSettings) => {
    setGameSettings(settings);
    setScore(0);
  };

  const handleExit = () => {
    setGameSettings(null);
  };

  const handleDisplaySize = (size: { width: number; height: number }) => {
    setDisplaySize(size);
  };

  const getFrameBase64 = () => {
    if (!webcamRef.current) return null;

    // Get the actual video element from the Webcam component
    const video = webcamRef.current.video;
    if (!video) return null;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 640;
    tempCanvas.height = 480;

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return null;

    // Draw from the video element instead of the ref directly
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Get base64 string (removing the data:image/png;base64, prefix)
    const base64String = tempCanvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    return base64String;
  };

  return (
    <div className="App">
      <div className="game-container">
        <CameraFeed ref={webcamRef} onDisplaySize={handleDisplaySize} />
        {gameSettings && displaySize ? (
          <>
            <Boulders
              handPositions={handPositions}
              displaySize={displaySize}
              gameSettings={gameSettings}
              onScoreUpdate={setScore}
            />
            <button className="exit-button" onClick={handleExit}>
              Exit
            </button>
            <div className="score">Score: {score}</div>
          </>
        ) : (
          <StartScreen onStart={handleStart} />
        )}
      </div>
    </div>
  );
}
