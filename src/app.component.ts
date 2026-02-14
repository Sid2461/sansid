import { Component, signal, ChangeDetectionStrategy, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ButtonStyle {
  position?: string;
  top?: string;
  left?: string;
  transition?: string;
  transform?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styles: [`
    /* Jelly Animation for the No button */
    @keyframes jelly {
      0% { transform: scale(1, 1); }
      30% { transform: scale(1.25, 0.75); }
      40% { transform: scale(0.75, 1.25); }
      50% { transform: scale(1.15, 0.85); }
      65% { transform: scale(0.95, 1.05); }
      75% { transform: scale(1.05, 0.95); }
      100% { transform: scale(1, 1); }
    }
    .jelly-effect {
      animation: jelly 0.5s;
    }
    
    .fade-in {
      animation: fadeIn 1s ease-out forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .heart-beat {
      animation: beat 1s infinite alternate;
    }

    @keyframes beat {
      to { transform: scale(1.1); }
    }
    
    .heart-pulse {
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  accepted = signal(false);
  noBtnStyle = signal<ButtonStyle>({});
  isJelly = signal(false);
  
  // Track consecutive attempts to make it harder
  attempts = signal(0);
  
  // Sentences to display on the No button to make it funny
  noBtnText = signal('No');
  
  readonly phrases = [
    'No',
    'Are you sure?',
    'Really sure?',
    'Think again!',
    'Last chance!',
    'Surely not?',
    'You might regret this!',
    'Give it another thought!',
    'Are you absolutely certain?',
    'This could be a mistake!',
    'Have a heart!',
    'Don\'t be so cold!',
    'Change of heart?',
    'Wouldn\'t you reconsider?',
    'Is that your final answer?',
    'You\'re breaking my heart ;('
  ];

  accept() {
    this.playSparkle();
    this.accepted.set(true);
  }

  onNoHover() {
    this.moveNoButton();
  }

  // Also handle click just in case they manage to click it on touch devices
  onNoClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.moveNoButton();
  }

  private moveNoButton() {
    this.playBoing();
    
    // Increment attempts
    this.attempts.update(v => v + 1);
    
    // Change text randomly
    const randomPhraseIndex = Math.floor(Math.random() * this.phrases.length);
    this.noBtnText.set(this.phrases[randomPhraseIndex]);

    // Calculate random position
    // We add some padding so it doesn't stick to the very edge
    const padding = 20;
    const buttonWidth = 150; // Estimated width
    const buttonHeight = 60; // Estimated height
    
    const maxWidth = window.innerWidth - buttonWidth - padding;
    const maxHeight = window.innerHeight - buttonHeight - padding;
    
    const randomX = Math.max(padding, Math.floor(Math.random() * maxWidth));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxHeight));

    this.noBtnStyle.set({
      position: 'fixed',
      left: `${randomX}px`,
      top: `${randomY}px`,
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      // zIndex: '50' // Ensure it stays on top
    });

    // Trigger jelly animation
    this.isJelly.set(true);
    setTimeout(() => {
      this.isJelly.set(false);
    }, 500);
  }
  
  private getAudioContext(): AudioContext | null {
    try {
      return new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
      return null;
    }
  }

  private playBoing() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pitch bend up then down
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  private playSparkle() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    // C Major 7 Arpeggio: C5, E5, G5, B5, C6
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + (i * 0.1);
      const duration = 1.0;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // quick attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}