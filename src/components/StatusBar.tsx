import React from "react";

interface StatusBarProps {
  score: number;
  currentRound: number;
  totalRounds: number;
  passThreshold: number;
  sessionComplete: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  score,
  currentRound,
  totalRounds,
  passThreshold,
  sessionComplete
}) => {
  const pass = score >= passThreshold;
  const statusText = sessionComplete
    ? pass
      ? "Session result: PASS"
      : "Session result: FAIL"
    : pass
    ? "On track"
    : "Keep tuning";

  return (
    <div className="status-bar card">
      <div className="status-item">
        <span className="status-label">Score</span>
        <span className="status-value score">
          {score.toFixed(0)} / 100
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Round</span>
        <span className="status-value">
          {Math.min(currentRound, totalRounds)} / {totalRounds}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Pass threshold</span>
        <span className="status-value">
          {passThreshold}+ points
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Status</span>
        <span className={`status-value ${pass ? "status-pass" : "status-fail"}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
