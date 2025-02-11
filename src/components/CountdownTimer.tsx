import { useEffect, useState } from "react";
import "@/src/styles/CountdownTimer.css";

interface CountdownTimerProps {
  onComplete: () => void;
}

export default function CountdownTimer({ onComplete }: CountdownTimerProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setCount(count - 1), 1000);

    return () => clearTimeout(timer);
  }, [count]);

  return count > 0 ? (
    <div className="countdown-overlay">
      <div className="countdown-number">{count}</div>
    </div>
  ) : null;
}
