/**
 * Soundbox Audio Synthesizer
 * Uses Web Audio API for melodic hardware chimes and Web Speech API for voice announcements.
 */

class SoundboxAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  public volume: number = 0.85; // 0.0 to 1.0
  public enabled: boolean = true;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a distinct melodic chime tone using Web Audio API oscillators.
   */
  public playChime(type: 'success' | 'alert' | 'notice'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled) return resolve();

      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;

        // Frequencies for the tones
        let notes: { freq: number; start: number; duration: number }[] = [];

        if (type === 'success') {
          // Melodic ascending triad: C5 (523.25), E5 (659.25), G5 (783.99) + high C6 (1046.50)
          notes = [
            { freq: 523.25, start: 0, duration: 0.12 },
            { freq: 659.25, start: 0.1, duration: 0.12 },
            { freq: 783.99, start: 0.2, duration: 0.14 },
            { freq: 1046.50, start: 0.32, duration: 0.35 },
          ];
        } else if (type === 'alert') {
          // Double cautionary tone: A4 (440) -> F4 (349.23)
          notes = [
            { freq: 440.0, start: 0, duration: 0.18 },
            { freq: 349.23, start: 0.22, duration: 0.35 },
          ];
        } else {
          // Gentle attention ding: E5 (659.25) -> B5 (987.77)
          notes = [
            { freq: 659.25, start: 0, duration: 0.12 },
            { freq: 987.77, start: 0.12, duration: 0.30 },
          ];
        }

        notes.forEach(({ freq, start, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = type === 'alert' ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + start);

          // Envelope
          gain.gain.setValueAtTime(0, now + start);
          gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + duration);
        });

        const totalDuration = notes.reduce((max, n) => Math.max(max, n.start + n.duration), 0);
        setTimeout(resolve, totalDuration * 1000);
      } catch (e) {
        console.warn('AudioContext playback error', e);
        resolve();
      }
    });
  }

  /**
   * Speaks the announcement using Web Speech API synthesis.
   */
  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled || !('speechSynthesis' in window)) {
        return resolve();
      }

      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 1.05; // Slightly faster, crisp retail pace
        utterance.pitch = 1.0;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error', e);
        resolve();
      }
    });
  }

  /**
   * Combined chime + voice broadcast
   */
  public async broadcast(type: 'success' | 'alert' | 'notice', text: string): Promise<void> {
    await this.playChime(type);
    await new Promise((r) => setTimeout(r, 150));
    await this.speak(text);
  }
}

export const soundbox = new SoundboxAudioSynthesizer();
