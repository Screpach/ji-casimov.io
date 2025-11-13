import React from "react";

interface StatusBarProps {
  score: number;
  currentRound: number;
  totalRounds: number;
  passThreshold: number;
  sessionComplete: boolean;
  examElapsedMs: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  score,
  currentRound,
  totalRounds,
  passThreshold,
  sessionComplete,
  examElapsedMs
}) => {
  const totalSeconds = Math.floor(examElapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timerLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const passState =
    sessionComplete && score >= passThreshold ? "PASS" : "TARGET";

  return (
    <div className="status-bar card">
      <div className="status-item">
        <span className="status-label">SCORE</span>
        <span className="status-value score">
          {score.toFixed(1)} / 100
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">ROUND</span>
        <span className="status-value">
          {currentRound} / {totalRounds}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">{passState}</span>
        <span
          className={
            "status-value " +
            (score >= passThreshold ? "status-pass" : "status-fail")
          }
        >
          {passThreshold.toFixed(0)}+
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">EXAM TIME</span>
        <span className="status-value status-timer">{timerLabel}</span>
      </div>
    </div>
  );
};

export default StatusBar;
