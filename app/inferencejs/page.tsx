"use client";

import Boulders from "@/components/Boulder";
import CameraFeed from "@/components/CameraFeed";
import StartScreen from "@/components/StartScreen";
import { useState, useEffect, useRef, useMemo } from "react";
import { GameSettings } from "@/types/settings.type";
import Webcam from "react-webcam";
import { InferenceEngine, CVImage } from "inferencejs";
import { Prediction } from "@/types/inference.type";
import { InferencejsPrediction } from "@/types/inference.type";

export default function Home() {
  const inferEngine = useMemo(() => {
    return new InferenceEngine();
  }, []);

  const webcamRef = useRef<Webcam | null>(null);
  const [modelWorkerId, setModelWorkerId] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [handPositions, setHandPositions] = useState<Prediction[]>([]);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!modelLoading) {
      setModelLoading(true);
      inferEngine
        .startWorker("distress-detection-a0xh3", 3, process.env.NEXT_PUBLIC_INFERENCEJS_API_KEY as string)
        .then((id: string) => setModelWorkerId(id));
    }
  }, [inferEngine, modelLoading]);

  useEffect(() => {
    if (!displaySize) return;

    const frameInterval = 1000 / 30; // 30 FPS
    let animationFrameId: number;
    let lastFrameTime = 0;

    const processFrame = async (timestamp: number) => {
      if (timestamp - lastFrameTime >= frameInterval && modelWorkerId) {
        try {
          const img = new CVImage(webcamRef.current?.video || null);
          const predictions = await inferEngine.infer(modelWorkerId, img);

          const scaledPredictions = predictions.map((prediction: InferencejsPrediction) => ({
            x: ((640 - (prediction.bbox.x + prediction.bbox.width)) * displaySize.width) / 640,
            y: (prediction.bbox.y * displaySize.height) / 480,
            width: (prediction.bbox.width * displaySize.width) / 640,
            height: (prediction.bbox.height * displaySize.height) / 480,
          }));

          setHandPositions(scaledPredictions);
        } catch (error) {
          console.error("Inference error:", error);
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
  }, [displaySize, modelWorkerId, inferEngine]);

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
