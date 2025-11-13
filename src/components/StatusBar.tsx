import React from "react";

interface StatusBarProps {
  score: number;
  currentRound: number;
  totalRounds: number;
  passThreshold: number;
  sessionComplete: boolean;
  globalElapsedSeconds: number;
  roundRemainingSeconds: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  score,
  currentRound,
  totalRounds,
  passThreshold,
  sessionComplete,
  globalElapsedSeconds,
  roundRemainingSeconds
}) => {
  const scoreDisplay = `${score.toFixed(1)} / 100`;
  const roundDisplay = `${currentRound} / ${totalRounds}`;
  const pass = score >= passThreshold;

  const mins = Math.floor(globalElapsedSeconds / 60);
  const secs = Math.floor(globalElapsedSeconds % 60);
  const globalTimeStr = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  const clampedRoundRem = Math.max(0, roundRemainingSeconds);
  const whole = Math.floor(clampedRoundRem);
  const centi = Math.floor((clampedRoundRem - whole) * 100);
  const roundTimeStr = `${whole.toString().padStart(2, "0")}.${centi
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">SCORE</span>
        <span className="status-value score">{scoreDisplay}</span>
      </div>
      <div className="status-item">
        <span className="status-label">ROUND</span>
        <span className="status-value">{roundDisplay}</span>
      </div>
      <div className="status-item timer-global">
        <span className="status-label">TOTAL TIME</span>
        <span className="status-value status-timer-global-value">
          {globalTimeStr}
        </span>
      </div>
      <div className="status-item timer-round">
        <span className="status-label">TASK COUNTDOWN</span>
        <span className="status-value status-timer-round-value">
          {roundTimeStr}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">RESULT</span>
        <span
          className={`status-value ${
            pass ? "status-pass" : "status-fail"
          }`}
        >
          {sessionComplete ? (pass ? "PASS" : "FAIL") : `TARGET ${passThreshold}+`}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
