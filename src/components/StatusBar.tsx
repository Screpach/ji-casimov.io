import React from "react";

interface StatusBarProps {
  score: number;
  currentRound: number;
  totalRounds: number;
  passThreshold: number;
  sessionComplete: boolean;
  elapsedExamMs: number | null;
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function formatExamTime(ms: number | null): string {
  if (ms === null) return "--:--";
  const total = Math.max(0, ms);
  const sec = Math.floor(total / 1000);
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min.toString().padStart(2, "0")}:${remSec
    .toString()
    .padStart(2, "0")}`;
}

const StatusBar: React.FC<StatusBarProps> = ({
  score,
  currentRound,
  totalRounds,
  passThreshold,
  sessionComplete,
  elapsedExamMs
}) => {
  const passStatus =
    sessionComplete && score >= passThreshold ? "PASS" : "TARGET";

  return (
    <div className="status-bar card">
      <div className="status-item">
        <span className="status-label">Score</span>
        <span className="status-value score">
          {formatScore(score)} / 100
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Round</span>
        <span className="status-value">
          {currentRound} / {totalRounds}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Pass threshold</span>
        <span
          className={`status-value ${
            score >= passThreshold ? "status-pass" : "status-fail"
          }`}
        >
          {passStatus} {passThreshold}+
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Exam time</span>
        <span className="status-value status-exam-timer">
          {formatExamTime(elapsedExamMs)}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
