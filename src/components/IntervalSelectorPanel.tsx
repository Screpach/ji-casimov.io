import React from "react";
import { IntervalDef, ratioToString } from "../audio/intervals";

interface IntervalSelectorPanelProps {
  intervals: IntervalDef[];
  selectedIntervalIds: number[];
  onToggleInterval: (id: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onStartExam: () => void;
  examStarted: boolean;
  canStartExam: boolean;
}

const IntervalSelectorPanel: React.FC<IntervalSelectorPanelProps> = ({
  intervals,
  selectedIntervalIds,
  onToggleInterval,
  onSelectAll,
  onSelectNone,
  onStartExam,
  examStarted,
  canStartExam
}) => {
  const basics = intervals.filter((i) => i.category !== "composed");
  const composed = intervals.filter((i) => i.category === "composed");
  const isSelected = (id: number) => selectedIntervalIds.includes(id);
  const activeCount = selectedIntervalIds.length;

  return (
    <div className="interval-selector card">
      <div className="interval-selector-header">
        <button
          className="btn btn-primary btn-start-exam"
          onClick={onStartExam}
          disabled={!canStartExam}
        >
          START EXAMINATION
        </button>
        <div className="interval-selector-buttons">
          <button className="btn btn-ghost" onClick={onSelectAll}>
            SELECT ALL
          </button>
          <button className="btn btn-ghost" onClick={onSelectNone}>
            SELECT NONE
          </button>
        </div>
      </div>

      <p className="interval-selector-subtitle">
        CHOOSE WHICH INTERVALS ARE PART OF THIS EXAM. THEN PRESS{" "}
        <strong>START EXAMINATION</strong>. YOU CAN RESTART THE EXAM LATER WITH
        THE SAME SELECTION.
      </p>

      <div className="interval-groups">
        <div className="interval-group">
          <h3>BASE JI INTERVALS</h3>
          <ul className="interval-list">
            {basics.map((interval) => (
              <li key={interval.id} className="interval-item">
                <label className="interval-label">
                  <input
                    type="checkbox"
                    checked={isSelected(interval.id)}
                    onChange={() => onToggleInterval(interval.id)}
                  />
                  <span className="interval-text">
                    <span className="interval-name">
                      {interval.name.toUpperCase()}
                    </span>
                    <span className="interval-ratio">
                      {ratioToString(interval.ratio)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="interval-group">
          <h3>COMPOSED INTERVALS (OCTAVE +)</h3>
          <ul className="interval-list">
            {composed.map((interval) => (
              <li key={interval.id} className="interval-item">
                <label className="interval-label">
                  <input
                    type="checkbox"
                    checked={isSelected(interval.id)}
                    onChange={() => onToggleInterval(interval.id)}
                  />
                  <span className="interval-text">
                    <span className="interval-name">
                      {interval.name.toUpperCase()}
                    </span>
                    <span className="interval-ratio">
                      {ratioToString(interval.ratio)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="interval-selector-footnote">
        ACTIVE IN EXAM: <strong>{activeCount}</strong> INTERVAL
        {activeCount === 1 ? "" : "S"}.
        {!canStartExam && (
          <>
            {" "}
            SELECT AT LEAST ONE INTERVAL TO ENABLE{" "}
            <strong>START EXAMINATION</strong>.
          </>
        )}
        {examStarted && (
          <>
            {" "}
            (EXAM RUNNING – CHANGES TAKE EFFECT ON THE NEXT RESTART.)
          </>
        )}
      </p>
    </div>
  );
};

export default IntervalSelectorPanel;
