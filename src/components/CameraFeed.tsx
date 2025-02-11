import React, { useEffect, useCallback, useRef, useLayoutEffect } from "react";
import Webcam from "react-webcam";
import "@/src/styles/CameraFeed.css";

interface CameraFeedProps {
  onDisplaySize: (size: { width: number; height: number }) => void;
  displaySize: { width: number; height: number } | null;
  setInferenceImageSize?: (size: { width: number; height: number }) => void;
}

const CameraFeed = React.forwardRef<Webcam, CameraFeedProps>(
  ({ onDisplaySize, displaySize, setInferenceImageSize }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleResize = useCallback(() => {
      if (containerRef.current) {
        onDisplaySize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });

        const targetArea = 640 * 480;
        const currentAspectRatio = containerRef.current.offsetWidth / containerRef.current.offsetHeight;

        // Calculate dimensions that maintain aspect ratio and hit target area
        const newWidth = Math.sqrt(targetArea * currentAspectRatio);
        const newHeight = newWidth / currentAspectRatio;

        if (setInferenceImageSize) {
          setInferenceImageSize({
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          });
        }
      }
    }, []);

    // Use layout effect to measure immediately after render
    useLayoutEffect(() => {
      handleResize();
    }, [handleResize]);

    useEffect(() => {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return (
      <div className="camera-container" ref={containerRef}>
        {displaySize && (
          <Webcam
            ref={ref}
            mirrored={true}
            className="webcam-feed"
            videoConstraints={{
              width: displaySize.width,
              height: displaySize.height,
            }}
          />
        )}
      </div>
    );
  }
);

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
