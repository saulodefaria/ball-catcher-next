import "@/src/styles/StartScreen.css";
import { GameSettings } from "@/src/types/settings.type";

const DIFFICULTY_SETTINGS: { [key: string]: GameSettings } = {
  easy: {
    spawnInterval: 1000,
    speed: 3,
    color: "#4CAF50",
    initialLives: 5,
    heartSpawnInterval: 5000, // 5 seconds
  },
  medium: {
    spawnInterval: 500,
    speed: 5,
    color: "#2196F3",
    initialLives: 5,
    heartSpawnInterval: 5000, // 5 seconds
  },
  hard: {
    spawnInterval: 300,
    speed: 7,
    color: "#FF9800",
    initialLives: 5,
    heartSpawnInterval: 10000, // 10 seconds
  },
  extreme: {
    spawnInterval: 200,
    speed: 10,
    color: "#f44336",
    initialLives: 5,
    heartSpawnInterval: 10000, // 10 seconds
  },
};

const StartScreen = ({ onStart }: { onStart: (settings: GameSettings) => void }) => {
  return (
    <div className="start-screen">
      <h1 className="text-center">Ball Catcher</h1>
      <h2 className="text-center">Catch the balls before they hit the ground!</h2>
      <div className="difficulty-select">
        <h3 className="text-white">Select Difficulty</h3>
        <div className="difficulty-buttons">
          {Object.entries(DIFFICULTY_SETTINGS).map(([level, settings]) => (
            <button
              key={level}
              onClick={() => onStart(settings)}
              className="difficulty-button"
              style={{
                backgroundColor: settings.color,
              }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
