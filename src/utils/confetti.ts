import confetti from 'canvas-confetti';

/**
 * Triggers a celebratory confetti burst when a user uploads their first research study.
 */
export function triggerFirstResearchConfetti() {
  // Center major burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    zIndex: 9999,
    colors: ['#046c4e', '#10b981', '#34d399', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ffffff'],
  });

  // Dual side cannon barrage over 2.5 seconds
  const duration = 2500;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);

    // Left cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() * 0.4 + 0.3 },
      colors: ['#046c4e', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
    });
    // Right cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() * 0.4 + 0.3 },
      colors: ['#046c4e', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
    });
  }, 200);
}
