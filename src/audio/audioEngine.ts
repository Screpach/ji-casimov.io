import { clamp } from "./dspUtils";

export interface IntervalAudioState {
  f1Hz: number;
  f2Hz: number;
  errorCents: number; // deviation from target JI ratio
}

/**
 * Simple Web Audio engine:
 * - Two primary oscillators (slightly bright "sawtooth" timbre) to expose beating/roughness.
 * - One additional "Tartini" oscillator approximating a combination tone.
 *
 * Qualitative behavior:
 * - As error_cents → 0, the Tartini tone gain increases smoothly (feels like a ghost tone "locking in").
 * - As error grows, the Tartini tone fades and only beating/roughness between primaries is obvious.
 * - Beating naturally slows as the two tones move toward the target Just Intonation ratio.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private primary1Osc: OscillatorNode | null = null;
  private primary2Osc: OscillatorNode | null = null;
  private primaryGain1: GainNode | null = null;
  private primaryGain2: GainNode | null = null;

  private tartiniOsc: OscillatorNode | null = null;
  private tartiniGain: GainNode | null = null;

  private isPlaying = false;

  private ensureContext(): void {
    if (!this.context) {
      const AudioContextCtor =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioContextCtor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.2;
      this.masterGain.connect(this.context.destination);
    }
  }

  async startInterval(state: IntervalAudioState): Promise<void> {
    this.ensureContext();
    if (!this.context || !this.masterGain) return;

    await this.context.resume();

    // Stop any previous sound
    this.stop();

    const ctx = this.context;

    this.primary1Osc = ctx.createOscillator();
    this.primary2Osc = ctx.createOscillator();
    this.primaryGain1 = ctx.createGain();
    this.primaryGain2 = ctx.createGain();

    this.primary1Osc.type = "sawtooth";
    this.primary2Osc.type = "sawtooth";

    this.primary1Osc.frequency.value = state.f1Hz;
    this.primary2Osc.frequency.value = state.f2Hz;

    // Modest level so beats/roughness are audible but not painful.
    this.primaryGain1.gain.value = 0.5;
    this.primaryGain2.gain.value = 0.5;

    this.primary1Osc.connect(this.primaryGain1);
    this.primary2Osc.connect(this.primaryGain2);
    this.primaryGain1.connect(this.masterGain);
    this.primaryGain2.connect(this.masterGain);

    // Tartini "difference tone" oscillator
    this.tartiniOsc = ctx.createOscillator();
    this.tartiniGain = ctx.createGain();
    this.tartiniOsc.type = "sine";

    this.tartiniOsc.connect(this.tartiniGain);
    this.tartiniGain.connect(this.masterGain);

    // Initial Tartini params
    this.updateTartiniFromState(state);

    const t = ctx.currentTime;
    this.primary1Osc.start(t);
    this.primary2Osc.start(t);
    this.tartiniOsc.start(t);

    this.isPlaying = true;
  }

  updateInterval(state: IntervalAudioState): void {
    if (!this.context || !this.isPlaying) return;

    const ctx = this.context;
    const t = ctx.currentTime;

    if (this.primary1Osc) {
      this.primary1Osc.frequency.setTargetAtTime(state.f1Hz, t, 0.02);
    }
    if (this.primary2Osc) {
      this.primary2Osc.frequency.setTargetAtTime(state.f2Hz, t, 0.02);
    }

    this.updateTartiniFromState(state);
  }

  stop(): void {
    if (!this.context) return;

    const ctx = this.context;
    const t = ctx.currentTime;

    const stopOsc = (osc: OscillatorNode | null) => {
      if (osc) {
        try {
          osc.stop(t + 0.02);
        } catch {
          // oscillator might already be stopped
        }
        osc.disconnect();
      }
    };

    if (this.primaryGain1) this.primaryGain1.disconnect();
    if (this.primaryGain2) this.primaryGain2.disconnect();
    if (this.tartiniGain) this.tartiniGain.disconnect();

    stopOsc(this.primary1Osc);
    stopOsc(this.primary2Osc);
    stopOsc(this.tartiniOsc);

    this.primary1Osc = null;
    this.primary2Osc = null;
    this.primaryGain1 = null;
    this.primaryGain2 = null;
    this.tartiniOsc = null;
    this.tartiniGain = null;

    this.isPlaying = false;
  }

  private updateTartiniFromState(state: IntervalAudioState): void {
    if (!this.context || !this.tartiniOsc || !this.tartiniGain) return;

    const ctx = this.context;
    const t = ctx.currentTime;

    const diffFreq = Math.abs(state.f2Hz - state.f1Hz) || 1;
    let tartiniFreq = diffFreq;

    // Keep difference tone in a reasonably audible range.
    if (tartiniFreq < 20) tartiniFreq = 20;
    if (tartiniFreq > 4000) tartiniFreq = 4000;

    this.tartiniOsc.frequency.setTargetAtTime(tartiniFreq, t, 0.02);

    // Closeness to target JI ratio (0..1); stronger near perfect tuning.
    const absErr = Math.abs(state.errorCents);
    const sigmaCents = 20; // width of the "lock-in" region
    const closeness = Math.exp(-(absErr * absErr) / (2 * sigmaCents * sigmaCents));

    // Weight for the difference frequency itself:
    // strongest for roughly 30–800 Hz, weaker outside.
    let bandWeight = 1;
    if (diffFreq < 30) {
      bandWeight = diffFreq / 30;
    } else if (diffFreq > 800) {
      bandWeight = clamp(800 / diffFreq, 0, 1);
    }

    const baseGain = 0.25; // overall loudness of the Tartini tone
    const gainValue = clamp(baseGain * closeness * bandWeight, 0, 0.4);

    this.tartiniGain.gain.setTargetAtTime(gainValue, t, 0.05);
  }
}

export const audioEngine = new AudioEngine();
