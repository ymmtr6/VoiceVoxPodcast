// components/ProgressModal.tsx
import React from "react";

interface ProgressModalProps {
  isOpen: boolean;
  progress: number;
  stopBtnFn?: () => void;
  startBtnFn?: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, progress, stopBtnFn, startBtnFn }) => {
  return (
    <div
      style={{
        display: isOpen ? "flex" : "none",
        position: "fixed",
        zIndex: 1,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "80%",
          height: "30px",
          backgroundColor: "#f3f3f3",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#4caf50",
            position: "absolute",
          }}
        ></div>
      </div>
      <button onClick={stopBtnFn}>STOP</button>
      <button onClick={startBtnFn}>START</button>
    </div>
  );
};

export default ProgressModal;
