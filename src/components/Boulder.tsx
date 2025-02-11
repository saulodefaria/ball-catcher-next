import { useEffect, useState, useMemo, Dispatch, SetStateAction } from "react";
import "@/src/styles/Boulder.css";
import { Prediction } from "@/src/types/inference.type";
import { GameSettings } from "@/src/types/settings.type";

const BOULDER_SIZE = 50; // pixels
const HEART_SIZE = 50; // pixels

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

const Heart = ({ x, y }: { x: number; y: number }) => {
  return (
    <div
      className="heart"
      style={{
        left: x,
        top: y,
        width: HEART_SIZE,
        height: HEART_SIZE,
        backgroundImage: "url('/heart.png')",
        backgroundSize: "cover",
        backgroundColor: "transparent",
        position: "absolute",
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
  setScore,
  lives,
  setLives,
  onGameOver,
}: {
  handPositions: Prediction[];
  displaySize: { width: number; height: number };
  gameSettings: GameSettings;
  setScore: Dispatch<SetStateAction<number>>;
  lives: number;
  setLives: Dispatch<SetStateAction<number>>;
  onGameOver: () => void;
}) => {
  const [boulders, setBoulders] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

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
      setBoulders((prev: { id: number; x: number; y: number }[]) => {
        return prev
          .map((boulder) => ({ ...boulder, y: boulder.y + gameSettings.speed }))
          .filter((boulder) => boulder.y < displaySize.height + BOULDER_SIZE);
      });
    }, 30);

    // Cleanup both intervals
    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameSettings, displaySize]);

  // Add heart spawning
  useEffect(() => {
    if (!gameSettings) return;

    const heartSpawnInterval = setInterval(() => {
      setHearts((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (displaySize.width - HEART_SIZE - 40),
          y: 0,
        },
      ]);
    }, gameSettings.heartSpawnInterval);

    // Move hearts
    const moveInterval = setInterval(() => {
      setHearts((prev) => {
        return prev
          .map((heart) => ({ ...heart, y: heart.y + gameSettings.speed * 0.7 })) // Hearts fall slower
          .filter((heart) => heart.y < displaySize.height + HEART_SIZE);
      });
    }, 30);

    return () => {
      clearInterval(heartSpawnInterval);
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
            setScore((prev) => prev + 1);
          }
        });

        // Check heart collisions
        hearts.forEach((heart) => {
          const heartObj = {
            x: heart.x,
            y: heart.y,
            width: HEART_SIZE,
            height: HEART_SIZE,
          };

          if (checkCollision(handObj, heartObj)) {
            setHearts((prev) => prev.filter((h) => h.id !== heart.id));
            setLives((prev) => Math.min(prev + 1, 5)); // Cap at 5 lives
          }
        });
      });
    }
  }, [handPositions, boulders, hearts, displaySize]);

  // Life reduction when boulder hits bottom
  useEffect(() => {
    if (boulders.some((boulder) => boulder.y >= displaySize.height)) {
      setLives((prev) => Math.max(0, prev - 1));
      setBoulders((prev) => prev.filter((boulder) => boulder.y < displaySize.height));
      if (lives <= 0) {
        onGameOver();
      }
    }
  }, [boulders, displaySize, lives, onGameOver]);

  return (
    <div className="boulders-container">
      {boulders.map((boulder) => (
        <Boulder key={boulder.id} x={boulder.x} y={boulder.y} />
      ))}
      {hearts.map((heart) => (
        <Heart key={heart.id} x={heart.x} y={heart.y} />
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
