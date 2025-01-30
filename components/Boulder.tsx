import { useEffect, useState, useMemo } from "react";
import "@/styles/Boulder.css";
import { Prediction } from "@/types/inference.type";
import { GameSettings } from "@/types/settings.type";

const BOULDER_SIZE = 50; // pixels

const BOULDER_COLORS = ["red", "blue", "green"];

const Boulder = ({ x, y }: { x: number; y: number }) => {
  const color = useMemo(() => BOULDER_COLORS[Math.floor(Math.random() * BOULDER_COLORS.length)], []);

  return (
    <div
      className="boulder"
      style={{
        left: x,
        top: y,
        width: BOULDER_SIZE,
        height: BOULDER_SIZE,
        backgroundImage: `url('/${color}.png')`,
        backgroundSize: "cover",
        backgroundColor: "transparent",
      }}
    />
  );
};

const DebugBox = ({ obj, color }: { obj: { x: number; y: number; width: number; height: number }; color: string }) => (
  <div
    style={{
      position: "absolute",
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
      border: `2px solid ${color}`,
      pointerEvents: "none",
      opacity: 0.5,
    }}
  />
);

const Boulders = ({
  handPositions,
  displaySize,
  gameSettings,
  onScoreUpdate,
}: {
  handPositions: Prediction[];
  displaySize: { width: number; height: number };
  gameSettings: GameSettings;
  onScoreUpdate: (score: number) => void;
}) => {
  const [boulders, setBoulders] = useState<{ id: number; x: number; y: number }[]>([]);
  const [, setScore] = useState(0);

  // Handle boulder spawning and movement
  useEffect(() => {
    if (!gameSettings) return;

    // Spawn new boulders
    const spawnInterval = setInterval(() => {
      setBoulders((prev: { id: number; x: number; y: number }[]) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (displaySize.width - BOULDER_SIZE - 40),
          y: 0,
        },
      ]);
    }, gameSettings.spawnInterval);

    // Move existing boulders
    const moveInterval = setInterval(() => {
      setBoulders((prev: { id: number; x: number; y: number }[]) =>
        prev
          .map((boulder) => ({ ...boulder, y: boulder.y + gameSettings.speed }))
          .filter((boulder) => boulder.y < displaySize.height)
      );
    }, 30);

    // Cleanup both intervals
    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameSettings, displaySize]);

  // Update collision detection with scaled coordinates
  useEffect(() => {
    if (handPositions && handPositions.length > 0) {
      handPositions.forEach((hand) => {
        const handObj = {
          x: hand.x + hand.width / 2,
          y: hand.y - hand.height / 2,
          width: hand.width,
          height: hand.height,
        };

        boulders.forEach((boulder) => {
          const boulderObj = {
            x: boulder.x,
            y: boulder.y,
            width: BOULDER_SIZE,
            height: BOULDER_SIZE,
          };

          if (checkCollision(handObj, boulderObj)) {
            setBoulders((prev) => prev.filter((b) => b.id !== boulder.id));
            setScore((prev) => {
              const newScore = prev + 1;
              onScoreUpdate(newScore);
              return newScore;
            });
          }
        });
      });
    }
  }, [handPositions, boulders, displaySize]);

  return (
    <div className="boulders-container">
      {boulders.map((boulder) => (
        <Boulder key={boulder.id} x={boulder.x} y={boulder.y} />
      ))}
      {process.env.NEXT_PUBLIC_DEBUG === "true" &&
        handPositions?.map((hand, i) => (
          <DebugBox
            key={i}
            obj={{
              x: hand.x + hand.width / 2,
              y: hand.y - hand.height / 2,
              width: hand.width,
              height: hand.height,
            }}
            color="red"
          />
        ))}
    </div>
  );
};

// Helper function to check collision between hand and boulder
const checkCollision = (
  hand: { x: number; y: number; width: number; height: number },
  boulder: { x: number; y: number; width: number; height: number }
) => {
  return (
    hand.x < boulder.x + boulder.width &&
    hand.x + hand.width > boulder.x &&
    hand.y < boulder.y + boulder.height &&
    hand.y + hand.height > boulder.y
  );
};

export default Boulders;
