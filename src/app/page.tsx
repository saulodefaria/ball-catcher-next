"use client";

import Boulders from "@/src/components/Boulder";
import CameraFeed from "@/src/components/CameraFeed";
import StartScreen from "@/src/components/StartScreen";
import { useState, useEffect, useRef, useMemo } from "react";
import { GameSettings } from "@/src/types/settings.type";
import Webcam from "react-webcam";
import { InferenceEngine, CVImage } from "inferencejs";
import { Prediction } from "@/src/types/inference.type";
import { InferencejsPrediction } from "@/src/types/inference.type";
import CountdownTimer from "@/src/components/CountdownTimer";

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
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [lives, setLives] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Load the model when the countdown starts
  useEffect(() => {
    if (isCountingDown && !modelWorkerId && !modelLoading) {
      setModelLoading(true);
      inferEngine
        .startWorker("distress-detection-a0xh3", 3, process.env.NEXT_PUBLIC_INFERENCEJS_API_KEY as string)
        .then((id: string) => setModelWorkerId(id));
    }
  }, [inferEngine, modelLoading, modelWorkerId, isCountingDown]);

  // Stop the model when the game is over
  useEffect(() => {
    if (!isGameActive && modelWorkerId) {
      inferEngine.stopWorker(modelWorkerId);
      setModelWorkerId(null);
      setModelLoading(false);
    }
  }, [isGameActive, modelWorkerId, inferEngine]);

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
            x: displaySize.width - (prediction.bbox.x + prediction.bbox.width),
            y: prediction.bbox.y,
            width: prediction.bbox.width,
            height: prediction.bbox.height,
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
    setLives(settings.initialLives);
    setGameOver(false);
    setIsCountingDown(true);
  };

  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    setIsGameActive(true);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsGameActive(false);
  };

  const handleExit = () => {
    setGameSettings(null);
    setIsGameActive(false);
    setGameOver(false);
  };

  const handleDisplaySize = (size: { width: number; height: number }) => {
    setDisplaySize(size);
  };

  return (
    <div className="App">
      <div className="game-container">
        <CameraFeed ref={webcamRef} onDisplaySize={handleDisplaySize} displaySize={displaySize} />
        {gameSettings && displaySize ? (
          <>
            {isCountingDown && <CountdownTimer onComplete={handleCountdownComplete} />}
            {gameOver ? (
              <div className="game-over-overlay">
                <div className="game-over-content">
                  <h2>Game Over!</h2>
                  <p>Final Score: {score}</p>
                  <button onClick={() => handleStart(gameSettings)}>Play Again</button>
                  <button onClick={handleExit}>Exit</button>
                </div>
              </div>
            ) : (
              isGameActive && (
                <Boulders
                  handPositions={handPositions}
                  displaySize={displaySize}
                  gameSettings={gameSettings}
                  setScore={setScore}
                  lives={lives}
                  setLives={setLives}
                  onGameOver={handleGameOver}
                />
              )
            )}
            <button className="exit-button" onClick={handleExit}>
              Exit
            </button>
            <div className="score">Score: {score}</div>
            <div className="lives">Lives: {lives}</div>
          </>
        ) : (
          <StartScreen onStart={handleStart} />
        )}
      </div>
    </div>
  );
}
