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
          Start Examination
        </button>
        <div className="interval-selector-buttons">
          <button className="btn btn-ghost" onClick={onSelectAll}>
            Select All
          </button>
          <button className="btn btn-ghost" onClick={onSelectNone}>
            Select None
          </button>
        </div>
      </div>

      <p className="interval-selector-subtitle">
        Choose which intervals are part of this exam. Then press{" "}
        <strong>START EXAMINATION</strong>. You can restart the exam later with
        the same selection.
      </p>

      <div className="interval-groups">
        <div className="interval-group">
          <h3>Base JI intervals</h3>
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
                    <span className="interval-name">{interval.name}</span>
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
          <h3>Composed intervals (octave +)</h3>
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
                    <span className="interval-name">{interval.name}</span>
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
        Active in exam: <strong>{activeCount}</strong> interval
        {activeCount === 1 ? "" : "s"}.
        {!canStartExam && (
          <>
            {" "}
            Select at least one interval to enable{" "}
            <strong>START EXAMINATION</strong>.
          </>
        )}
        {examStarted && (
          <>
            {" "}
            (Exam running – changes take effect on the next restart.)
          </>
        )}
      </p>
    </div>
  );
};

export default IntervalSelectorPanel;
