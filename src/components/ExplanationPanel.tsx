import React from "react";

const ExplanationPanel: React.FC = () => {
  return (
    <div className="info-panel card">
      <h2>How to listen</h2>
      <p>
        This trainer uses <strong>Just Intonation</strong> intervals, built from
        simple whole-number ratios. When you hit the sweet spot, the interval
        often feels <em>smooth</em>, <em>pure</em>, or like it suddenly{" "}
        <em>rings</em>.
      </p>

      <h3>Beating</h3>
      <p>
        When two notes are almost, but not quite, in tune, you hear a gentle{" "}
        <strong>pulsing</strong> or <strong>wobble</strong> in the sound. Those
        are <em>beats</em>. As you tune closer, the pulsing slows down. When
        you&apos;re really close, it can almost disappear.
      </p>

      <h3>Tartini (ghost) tones</h3>
      <p>
        With strong, steady tones, you may notice a third,{" "}
        <strong>ghost-like note</strong>. It&apos;s not actually being played –
        your ears and brain create it. When the interval is really well in
        tune, this ghost note often feels more stable, as if the sound suddenly
        <em>locks into place</em>.
      </p>

      <p className="info-small">
        Tip: Move the slider slowly and listen for the beats to calm down and
        for the sound to feel more solid and centered. Trust your ears more
        than your eyes – the correct spot is not always in the middle.
      </p>
    </div>
  );
};

export default ExplanationPanel;
