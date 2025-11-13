import React, { useEffect, useRef, useState } from "react";
import { ALL_INTERVALS, IntervalDef, ratioToString } from "./audio/intervals";
import {
  clamp,
  centsToRatio,
  freqFromMidi,
  randomFloat,
  randomInt
} from "./audio/dspUtils";
import { audioEngine, IntervalAudioState } from "./audio/audioEngine";
import StatusBar from "./components/StatusBar";
import ExplanationPanel from "./components/ExplanationPanel";
import LicensePanel from "./components/LicensePanel";
import IntervalSelectorPanel from "./components/IntervalSelectorPanel";

const TOTAL_ROUNDS = 30;
const PASS_THRESHOLD = 75;
const SLIDER_RANGE_CENTS = 150;
const MAX_DETUNE_CENTS = 75;
const MAX_ROUND_DURATION_SECONDS = 20;

// Hint system
const MAX_HINTS_PER_SESSION = 6;
const HINT_PENALTIES = [-1, -2, -3, -4, -5, -6];

// Final-score normalization (no per-round clamping)
const MAX_POINTS_PER_ROUND_WITHOUT_HINTS = 7;
const MAX_TOTAL_POINTS_WITHOUT_HINTS =
  MAX_POINTS_PER_ROUND_WITHOUT_HINTS * TOTAL_ROUNDS;

const ALL_INTERVAL_IDS = ALL_INTERVALS.map((i) => i.id);

interface RoundConfig {
  index: number;
  baseFreqHz: number;
  interval: IntervalDef;
  tuneUpper: boolean;
  sliderCorrectPosition: number;
  sliderRangeCents: number;
  initialDetuneCents: number;
  initialSliderValue: number;
}

interface RoundResult {
  roundIndex: number;
  errorCents: number;
  deltaScore: number;
  timeSeconds: number;
  contributions: string[];
}

interface TuningErrorBand {
  name: string;
  minAbsErrorCents: number;
  maxAbsErrorCents: number | null;
  minInclusive: boolean;
  maxInclusive: boolean;
  points: number;
}

interface TimeBand {
  name: string;
  minSeconds: number;
  maxSeconds: number;
  minInclusive: boolean;
  maxInclusive: boolean;
  points: number;
}

const TUNING_ERROR_BANDS: TuningErrorBand[] = [
  {
    name: "world_class",
    minAbsErrorCents: 0.0,
    maxAbsErrorCents: 2.0,
    minInclusive: true,
    maxInclusive: false,
    points: 6
  },
  {
    name: "excellent",
    minAbsErrorCents: 2.0,
    maxAbsErrorCents: 5.0,
    minInclusive: true,
    maxInclusive: false,
    points: 4
  },
  {
    name: "good",
    minAbsErrorCents: 5.0,
    maxAbsErrorCents: 10.0,
    minInclusive: true,
    maxInclusive: false,
    points: 2
  },
  {
    name: "borderline",
    minAbsErrorCents: 10.0,
    maxAbsErrorCents: 20.0,
    minInclusive: true,
    maxInclusive: false,
    points: 0
  },
  {
    name: "poor",
    minAbsErrorCents: 20.0,
    maxAbsErrorCents: 40.0,
    minInclusive: true,
    maxInclusive: false,
    points: -2
  },
  {
    name: "very_poor",
    minAbsErrorCents: 40.0,
    maxAbsErrorCents: null,
    minInclusive: true,
    maxInclusive: false,
    points: -4
  }
];

const TIME_BANDS: TimeBand[] = [
  {
    name: "fast",
    minSeconds: 0.0,
    maxSeconds: 6.0,
    minInclusive: true,
    maxInclusive: false,
    points: 1
  },
  {
    name: "medium",
    minSeconds: 6.0,
    maxSeconds: 12.0,
    minInclusive: true,
    maxInclusive: true,
    points: 0
  },
  {
    name: "slow",
    minSeconds: 12.0,
    maxSeconds: 20.0,
    minInclusive: false,
    maxInclusive: true,
    points: -1
  }
];

function isWithin(
  value: number,
  min: number,
  max: number | null,
  minInclusive: boolean,
  maxInclusive: boolean
): boolean {
  const passMin = minInclusive ? value >= min : value > min;
  const passMax =
    max === null ? true : maxInclusive ? value <= max : value < max;
  return passMin && passMax;
}

function getTuningErrorBand(absErrorCents: number): TuningErrorBand {
  for (const band of TUNING_ERROR_BANDS) {
    if (
      isWithin(
        absErrorCents,
        band.minAbsErrorCents,
        band.maxAbsErrorCents,
        band.minInclusive,
        band.maxInclusive
      )
    ) {
      return band;
    }
  }
  return TUNING_ERROR_BANDS[TUNING_ERROR_BANDS.length - 1];
}

function getTimeBand(elapsedSeconds: number): TimeBand {
  for (const band of TIME_BANDS) {
    if (
      isWithin(
        elapsedSeconds,
        band.minSeconds,
        band.maxSeconds,
        band.minInclusive,
        band.maxInclusive
      )
    ) {
      return band;
    }
  }
  return TIME_BANDS[TIME_BANDS.length - 1];
}

function createSessionRounds(
  allIntervals: IntervalDef[],
  count: number,
  selectedIntervalIds: number[]
): RoundConfig[] {
  const pool = allIntervals.filter((i) => selectedIntervalIds.includes(i.id));
  const effectivePool = pool.length > 0 ? pool : allIntervals;

  const rounds: RoundConfig[] = [];
  let previousIntervalId: number | null = null;

  for (let i = 0; i < count; i++) {
    let interval: IntervalDef;
    do {
      interval = effectivePool[randomInt(0, effectivePool.length - 1)];
    } while (
      previousIntervalId !== null &&
      interval.id === previousIntervalId &&
      effectivePool.length > 1
    );
    previousIntervalId = interval.id;

    const midiBase = randomInt(45, 64);
    const baseFreqHz = freqFromMidi(midiBase);
    const tuneUpper = Math.random() < 0.5;

    const sliderCorrectPosition = randomFloat(0.15, 0.85);
    const initialDetuneCents = randomFloat(-MAX_DETUNE_CENTS, MAX_DETUNE_CENTS);

    const initialSliderRaw =
      sliderCorrectPosition + initialDetuneCents / SLIDER_RANGE_CENTS;
    const initialSliderValue = clamp(initialSliderRaw, 0, 1);

    rounds.push({
      index: i,
      baseFreqHz,
      interval,
      tuneUpper,
      sliderCorrectPosition,
      sliderRangeCents: SLIDER_RANGE_CENTS,
      initialDetuneCents,
      initialSliderValue
    });
  }

  return rounds;
}

function computeAudioState(
  round: RoundConfig,
  sliderValue: number
): IntervalAudioState & { centsOffset: number; rActual: number } {
  const [a, b] = round.interval.ratio;
  const rTarget = a / b;

  const sliderDelta = sliderValue - round.sliderCorrectPosition;
  const centsOffset = sliderDelta * round.sliderRangeCents;
  const centsFactor = centsToRatio(centsOffset);

  let fLower: number;
  let fUpper: number;

  if (round.tuneUpper) {
    const lower = round.baseFreqHz;
    const upperTarget = lower * rTarget;
    const upper = upperTarget * centsFactor;
    fLower = lower;
    fUpper = upper;
  } else {
    const upper = round.baseFreqHz;
    const lowerTarget = upper / rTarget;
    const lower = lowerTarget * centsFactor;
    fLower = lower;
    fUpper = upper;
  }

  const minFreq = Math.min(fLower, fUpper);
  const maxFreq = Math.max(fLower, fUpper);
  const rActual = maxFreq / minFreq;
  const errorCents = 1200 * Math.log2(rActual / rTarget);

  return {
    f1Hz: fLower,
    f2Hz: fUpper,
    errorCents,
    centsOffset,
    rActual
  };
}

function computeRoundScore(
  errorCents: number,
  elapsedSecondsCapped: number,
  hintPenalty: number,
  hintIndexUsed: number | null
): { delta: number; contributions: string[] } {
  const absError = Math.abs(errorCents);
  const tuningBand = getTuningErrorBand(absError);
  const timeBand = getTimeBand(elapsedSecondsCapped);

  const contributions: string[] = [];

  contributions.push(
    `Accuracy band "${tuningBand.name}" (${tuningBand.points >= 0 ? "+" : ""}${
      tuningBand.points
    } pts)`
  );

  contributions.push(
    `Time band "${timeBand.name}" (${timeBand.points >= 0 ? "+" : ""}${
      timeBand.points
    } pts)`
  );

  if (hintIndexUsed !== null) {
    contributions.push(`Hint #${hintIndexUsed} penalty (${hintPenalty} pts)`);
  }

  const delta = tuningBand.points + timeBand.points + hintPenalty;
  return { delta, contributions };
}

function computeNormalizedScore(totalPoints: number): number {
  const raw = (totalPoints / MAX_TOTAL_POINTS_WITHOUT_HINTS) * 100.0;
  return clamp(raw, 0, 100);
}

const App: React.FC = () => {
  // Disclaimer: must acknowledge before license.
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  const [isHeadphoneTestPlaying, setIsHeadphoneTestPlaying] = useState(false);

  // License: null = not answered; true = accepted; false = not accepted (blocked).
  const [licenseAccepted, setLicenseAccepted] = useState<boolean | null>(null);

  // Exam started (after clicking "START EXAMINATION").
  const [examStarted, setExamStarted] = useState(false);

  const [selectedIntervalIds, setSelectedIntervalIds] =
    useState<number[]>(ALL_INTERVAL_IDS);

  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0.5);

  const [totalPoints, setTotalPoints] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  const [hintVisible, setHintVisible] = useState(false);
  const [hintIndexUsedThisRound, setHintIndexUsedThisRound] = useState<
    number | null
  >(null);
  const [hintsUsedInSession, setHintsUsedInSession] = useState(0);

  const autoSubmitTimeoutRef = useRef<number | null>(null);

  const currentRound =
    examStarted && rounds.length > 0 ? rounds[currentRoundIndex] : null;
  const normalizedScore = computeNormalizedScore(totalPoints);

  // Hint window: 30-cent wide window centered on correct position
  let hintLeftPercent = 0;
  let hintWidthPercent = 0;
  if (currentRound) {
    const halfWindowCents = 15; // 30-cent total window
    const half = halfWindowCents / currentRound.sliderRangeCents;
    const start = Math.max(0, currentRound.sliderCorrectPosition - half);
    const end = Math.min(1, currentRound.sliderCorrectPosition + half);
    hintLeftPercent = start * 100;
    hintWidthPercent = (end - start) * 100;
  }

  useEffect(() => {
    return () => {
      audioEngine.stop();
      if (autoSubmitTimeoutRef.current !== null) {
        clearTimeout(autoSubmitTimeoutRef.current);
        autoSubmitTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!examStarted || !currentRound) return;

    if (autoSubmitTimeoutRef.current !== null) {
      clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }

    setSliderValue(currentRound.initialSliderValue);
    setRoundStartTime(null);
    setRoundCompleted(false);
    setHintVisible(false);
    setHintIndexUsedThisRound(null);
    audioEngine.stop();
  }, [examStarted, currentRoundIndex, currentRound]);

  const clearAutoSubmitTimer = () => {
    if (autoSubmitTimeoutRef.current !== null) {
      clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }
  };

  const startNewExamSession = () => {
    const newRounds = createSessionRounds(
      ALL_INTERVALS,
      TOTAL_ROUNDS,
      selectedIntervalIds
    );
    setRounds(newRounds);
    setCurrentRoundIndex(0);
    setTotalPoints(0);
    setRoundStartTime(null);
    setRoundCompleted(false);
    setLastResult(null);
    setSessionComplete(false);
    setHintVisible(false);
    setHintIndexUsedThisRound(null);
    setHintsUsedInSession(0);
    clearAutoSubmitTimer();
    audioEngine.stop();
    setExamStarted(true);

    if (newRounds[0]) {
      setSliderValue(newRounds[0].initialSliderValue);
    } else {
      setSliderValue(0.5);
    }
  };

  const handlePlay = async () => {
    if (!licenseAccepted || !examStarted || !currentRound || sessionComplete) {
      return;
    }

    const now = performance.now();
    setRoundStartTime(now);

    clearAutoSubmitTimer();
    autoSubmitTimeoutRef.current = window.setTimeout(() => {
      handleDone(true);
    }, MAX_ROUND_DURATION_SECONDS * 1000);

    const audioState = computeAudioState(currentRound, sliderValue);
    await audioEngine.startInterval(audioState);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentRound || !examStarted) return;

    const value = parseFloat(e.target.value);
    setSliderValue(value);

    const audioState = computeAudioState(currentRound, value);
    audioEngine.updateInterval(audioState);
  };

  const handleDone = (auto = false) => {
    if (!currentRound || roundCompleted || !examStarted) return;

    clearAutoSubmitTimer();

    const audioState = computeAudioState(currentRound, sliderValue);
    audioEngine.stop();

    const now = performance.now();
    const elapsedSecondsRaw = roundStartTime
      ? (now - roundStartTime) / 1000
      : MAX_ROUND_DURATION_SECONDS;
    const elapsedSeconds = Math.min(
      elapsedSecondsRaw,
      MAX_ROUND_DURATION_SECONDS
    );

    let hintPenalty = 0;
    if (hintIndexUsedThisRound !== null) {
      const index = Math.min(
        hintIndexUsedThisRound - 1,
        HINT_PENALTIES.length - 1
      );
      hintPenalty = HINT_PENALTIES[index];
    }

    const { delta, contributions } = computeRoundScore(
      audioState.errorCents,
      elapsedSeconds,
      hintPenalty,
      hintIndexUsedThisRound
    );

    setTotalPoints((prev) => prev + delta);
    setRoundCompleted(true);

    const result: RoundResult = {
      roundIndex: currentRound.index,
      errorCents: audioState.errorCents,
      deltaScore: delta,
      timeSeconds: elapsedSeconds,
      contributions
    };
    setLastResult(result);

    if (currentRoundIndex === rounds.length - 1) {
      setSessionComplete(true);
    }
  };

  const handleNextRound = () => {
    if (!examStarted) return;

    if (sessionComplete) {
      handleRestart();
      return;
    }
    if (!roundCompleted) return;

    if (currentRoundIndex < rounds.length - 1) {
      setCurrentRoundIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    if (!licenseAccepted) return;
    startNewExamSession();
  };

  const handleHint = () => {
    if (
      !currentRound ||
      !examStarted ||
      sessionComplete ||
      hintVisible ||
      roundCompleted ||
      hintsUsedInSession >= MAX_HINTS_PER_SESSION
    ) {
      return;
    }

    const newIndex = hintsUsedInSession + 1;
    setHintsUsedInSession(newIndex);
    setHintIndexUsedThisRound(newIndex);
    setHintVisible(true);
  };

  const handleToggleInterval = (id: number) => {
    setSelectedIntervalIds((prev) => {
      const isOn = prev.includes(id);
      if (isOn) {
        if (prev.length <= 1) {
          return prev;
        }
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllIntervals = () => {
    setSelectedIntervalIds(ALL_INTERVAL_IDS);
  };

  const handleSelectNoneIntervals = () => {
    setSelectedIntervalIds([]);
  };

  const handleStartExam = () => {
    if (!licenseAccepted) return;
    if (selectedIntervalIds.length === 0) return;
    startNewExamSession();
  };

  const handleAcceptLicense = () => {
    setLicenseAccepted(true);
  };

  const handleRejectLicense = () => {
    setLicenseAccepted(false);
    audioEngine.stop();
  };

  const handleHeadphoneTestStart = async () => {
    // Simple pure fifth test: 440 Hz and 660 Hz
    const state: IntervalAudioState = {
      f1Hz: 440,
      f2Hz: 660,
      errorCents: 0,
      centsOffset: 0,
      rActual: 1.5
    };
    await audioEngine.startInterval(state);
    setIsHeadphoneTestPlaying(true);
  };

  const handleHeadphoneTestStop = () => {
    audioEngine.stop();
    setIsHeadphoneTestPlaying(false);
  };

  const handleCloseDisclaimer = () => {
    audioEngine.stop();
    setIsHeadphoneTestPlaying(false);
    setDisclaimerAcknowledged(true);
  };

  const handlePanicStop = () => {
    // Emergency "kill sound" – just stop audio; timers keep running.
    audioEngine.stop();
  };

  const lastResultForCurrentRound =
    lastResult && currentRound && lastResult.roundIndex === currentRound.index
      ? lastResult
      : null;

  const directionLabel = (errorCents: number): string => {
    const absErr = Math.abs(errorCents);
    if (absErr <= 2) return "very tight";
    return errorCents > 0 ? "sharp" : "flat";
  };

  const hintAvailable = hintsUsedInSession < MAX_HINTS_PER_SESSION;
  const canStartExam = !!licenseAccepted && selectedIntervalIds.length > 0;
  const currentRoundDisplay = examStarted ? currentRoundIndex + 1 : 0;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="branding">
          <h1>Just Intonation Interval Trainer</h1>
          <p className="subtitle">
            Paris Conservatoire-style tuning exam · tune by ear using beats and
            ghost tones.
          </p>
        </div>
        <StatusBar
          score={normalizedScore}
          currentRound={currentRoundDisplay}
          totalRounds={TOTAL_ROUNDS}
          passThreshold={PASS_THRESHOLD}
          sessionComplete={sessionComplete}
        />
      </header>

      <main className="app-main">
        {/* LEFT: interval selector + explanation */}
        <aside className="side-column">
          <IntervalSelectorPanel
            intervals={ALL_INTERVALS}
            selectedIntervalIds={selectedIntervalIds}
            onToggleInterval={handleToggleInterval}
            onSelectAll={handleSelectAllIntervals}
            onSelectNone={handleSelectNoneIntervals}
            onStartExam={handleStartExam}
            examStarted={examStarted}
            canStartExam={canStartExam}
          />
          {examStarted && <ExplanationPanel />}
        </aside>

        {/* RIGHT: game panel */}
        <section className="game-panel card">
          {!examStarted ? (
            <>
              <div className="round-header">
                <h2>Examination not started</h2>
              </div>
              <p className="feedback-hint">
                1. Read the audio disclaimer and accept it. <br />
                2. Accept the license. <br />
                3. On the left, select which intervals you want in the exam.{" "}
                <br />
                4. Press <strong>START EXAMINATION</strong>. <br />
                The tuning panel and audio controls will then become active.
              </p>
            </>
          ) : currentRound ? (
            <>
              <div className="round-header">
                <h2>Round {currentRoundIndex + 1}</h2>
                <p className="round-interval-name">
                  {currentRound.interval.name}{" "}
                  <span className="round-interval-ratio">
                    ({ratioToString(currentRound.interval.ratio)})
                  </span>
                </p>
              </div>

              <div className="round-meta">
                <div className="round-meta-item">
                  <span className="meta-label">Anchor note</span>
                  <span className="meta-value">
                    {currentRound.baseFreqHz.toFixed(1)} Hz
                  </span>
                </div>
                <div className="round-meta-item">
                  <span className="meta-label">You tune</span>
                  <span className="meta-value">
                    {currentRound.tuneUpper
                      ? "Upper (higher) note"
                      : "Lower (bass) note"}
                  </span>
                </div>
                <div className="round-meta-item">
                  <span className="meta-label">Session mode</span>
                  <span className="meta-value">
                    {TOTAL_ROUNDS} rounds · pass at {PASS_THRESHOLD}+ points
                  </span>
                </div>
              </div>

              <div className="controls-row">
                <div className="controls-main">
                  <button
                    className="btn btn-primary"
                    onClick={handlePlay}
                    disabled={sessionComplete || roundCompleted}
                  >
                    ▶ PLAY
                  </button>
                  <button
                    className="btn btn-panic"
                    onClick={handlePanicStop}
                  >
                    PANIC / Stop Sound
                  </button>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleDone(false)}
                  disabled={sessionComplete || roundCompleted}
                >
                  DONE
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleHint}
                  disabled={
                    sessionComplete ||
                    hintVisible ||
                    roundCompleted ||
                    !hintAvailable
                  }
                >
                  💡 Hint
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleNextRound}
                  disabled={!roundCompleted && !sessionComplete}
                >
                  {sessionComplete ? "Restart session" : "Next round"}
                </button>
              </div>

              <div className="slider-block">
                <label htmlFor="tuning-slider" className="slider-label">
                  Tuning slider
                </label>
                <div className="slider-wrapper">
                  <input
                    id="tuning-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.001}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="tuning-slider"
                  />
                  {hintVisible && (
                    <div className="slider-hint-bar">
                      <div
                        className="slider-hint-window"
                        style={{
                          left: `${hintLeftPercent}%`,
                          width: `${hintWidthPercent}%`
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="slider-helper">
                  Move slowly until the beats calm down and the sound feels{" "}
                  <em>steady</em>. The correct tuning point is different every
                  round and is <strong>not</strong> visually marked.{" "}
                  The <strong>Hint</strong> button reveals a{" "}
                  <strong>30-cent wide</strong> window centered on the correct
                  answer; hints are limited and become more expensive as you use
                  them.
                </p>
                {!hintAvailable && (
                  <p className="slider-helper">
                    Hint quota used: <strong>{MAX_HINTS_PER_SESSION}</strong> /
                    {MAX_HINTS_PER_SESSION}. No more hints available this
                    session.
                  </p>
                )}
              </div>

              <div className="round-feedback">
                {lastResultForCurrentRound ? (
                  <>
                    <h3>Round result</h3>
                    <p className="feedback-main">
                      Tuning error:{" "}
                      <strong>
                        {Math.abs(lastResultForCurrentRound.errorCents).toFixed(
                          2
                        )}{" "}
                        cents
                      </strong>{" "}
                      (
                      {directionLabel(
                        lastResultForCurrentRound.errorCents
                      )}
                      )
                    </p>
                    <p className="feedback-sub">
                      Time (capped at {MAX_ROUND_DURATION_SECONDS}s):{" "}
                      <strong>
                        {lastResultForCurrentRound.timeSeconds.toFixed(2)} s
                      </strong>{" "}
                      · Round score change:{" "}
                      <strong>
                        {lastResultForCurrentRound.deltaScore > 0 ? "+" : ""}
                        {lastResultForCurrentRound.deltaScore}
                      </strong>
                    </p>
                    <ul className="feedback-list">
                      {lastResultForCurrentRound.contributions.map(
                        (c, idx) => (
                          <li key={idx}>{c}</li>
                        )
                      )}
                    </ul>
                  </>
                ) : (
                  <p className="feedback-hint">
                    Press <strong>PLAY</strong>, listen, gently move the slider,
                    then hit <strong>DONE</strong> when you feel the interval
                    lock in. If you wait more than{" "}
                    {MAX_ROUND_DURATION_SECONDS}
                    s, the system will auto-submit your current tuning for this
                    round.
                  </p>
                )}
              </div>

              {sessionComplete && (
                <div className="session-summary">
                  <h3>Session complete</h3>
                  <p>
                    Final score:{" "}
                    <strong>
                      {normalizedScore.toFixed(1)} / 100 –{" "}
                      {normalizedScore >= PASS_THRESHOLD ? "PASS ✅" : "FAIL ❌"}
                    </strong>
                  </p>
                  <p className="session-summary-text">
                    You can restart to get a fresh exam using the currently
                    selected intervals on the left. Scoring is normalized so{" "}
                    <strong>210 points</strong> (all world-class &amp; fast)
                    maps to <strong>100/100</strong>.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p>Waiting for examination to start…</p>
          )}
        </section>
      </main>

      <footer className="app-footer" />

      {/* Audio DISCLAIMER overlay – appears first */}
      {!disclaimerAcknowledged && licenseAccepted !== false && (
        <div className="license-overlay">
          <div className="license-dialog card">
            <h2>Audio disclaimer – use headphones</h2>
            <div className="license-scroll">
              <p>
                For accurate tuning and to protect your ears,{" "}
                <strong>please use good-quality headphones</strong> at a
                moderate volume.
              </p>
              <p>
                This exam uses steady pure tones that can become fatiguing at
                high levels. If you feel any discomfort,{" "}
                <strong>stop immediately</strong> and take a break.
              </p>
              <p>
                You can use the test below to make sure your headphones are
                working and the level feels comfortable before you start.
              </p>
            </div>
            <div className="license-actions">
              <button
                className="btn btn-secondary"
                onClick={handleHeadphoneTestStart}
                disabled={isHeadphoneTestPlaying}
              >
                Test Headphones
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleHeadphoneTestStop}
                disabled={!isHeadphoneTestPlaying}
              >
                Stop Test
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCloseDisclaimer}
              >
                Close Disclaimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* License overlay – shown after disclaimer is closed, until Accept/Not Accept */}
      {disclaimerAcknowledged && licenseAccepted === null && (
        <div className="license-overlay">
          <div className="license-dialog card">
            <LicensePanel />
            <div className="license-actions">
              <button
                className="btn btn-primary"
                onClick={handleAcceptLicense}
              >
                Accept
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleRejectLicense}
              >
                Not Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Black screen if license is not accepted */}
      {licenseAccepted === false && (
        <div className="blocked-overlay">
          <div className="blocked-message">
            <h2>License not accepted</h2>
            <p>
              You did not accept the Testing-Only, No-Copy Software License
              (CTOL v1.0). The application is blocked and cannot be used.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
