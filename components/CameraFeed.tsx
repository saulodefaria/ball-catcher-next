import React, { useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import "@/styles/CameraFeed.css";

interface CameraFeedProps {
  onDisplaySize: (size: { width: number; height: number }) => void;
}

const CameraFeed = React.forwardRef<Webcam, CameraFeedProps>(({ onDisplaySize }, ref) => {
  const handleResize = useCallback(() => {
    const container = document.querySelector(".camera-container");
    if (container) {
      onDisplaySize({
        width: (container as HTMLElement).offsetWidth,
        height: (container as HTMLElement).offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="camera-container">
      <Webcam
        ref={ref}
        mirrored={true}
        className="webcam-feed"
        videoConstraints={{
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
});

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
