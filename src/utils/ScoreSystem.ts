export class ScoreSystem {
  baseScore: number;
  currentScore: number;
  comboCount: number;
  comboMultiplier: number;
  maxComboMultiplier: number;
  streakCount: number;
  streakBonus: number;
  highScore: number;
  lastActionTime: number;
  comboTimeWindow: number;

  constructor() {
    this.baseScore = 100;
    this.currentScore = 0;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.maxComboMultiplier = 5;
    this.streakCount = 0;
    this.streakBonus = 0;
    this.highScore = this.loadHighScore();
    this.lastActionTime = Date.now();
    this.comboTimeWindow = 3000;
  }

  addPoint(): number {
    const now = Date.now();
    if (now - this.lastActionTime > this.comboTimeWindow) {
      this.resetCombo();
    }
    this.lastActionTime = now;
    this.comboCount++;
    this.updateComboMultiplier();
    const pointsGained = this.baseScore * this.comboMultiplier + this.streakBonus;
    this.currentScore += pointsGained;
    this.updateStreak(true);
    this.checkForMilestones();
    return pointsGained;
  }

  resetCombo(): void {
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.updateStreak(false);
  }

  private updateComboMultiplier(): void {
    this.comboMultiplier = Math.min(1 + Math.floor(this.comboCount / 5), this.maxComboMultiplier);
  }

  private updateStreak(success: boolean): void {
    if (success) {
      this.streakCount++;
      if (this.streakCount % 10 === 0) {
        this.streakBonus += 50;
      }
    } else {
      this.streakCount = 0;
      this.streakBonus = 0;
    }
  }

  private checkForMilestones(): void {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore();
      this.onNewHighScore();
    }
    if (this.comboMultiplier === this.maxComboMultiplier) {
      this.onMaxCombo();
    }
  }

  private onNewHighScore(): void {
    // Trigger UI celebration, sound, etc.
    // ...implement as needed...
  }

  private onMaxCombo(): void {
    // Trigger special effects, on-screen message
    // ...implement as needed...
  }

  private saveHighScore(): void {
    localStorage.setItem('avalancheRushHighScore', this.highScore.toString());
  }

  private loadHighScore(): number {
    const saved = localStorage.getItem('avalancheRushHighScore');
    return saved ? parseInt(saved, 10) : 0;
  }

  resetCurrentGame(): void {
    this.currentScore = 0;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.streakCount = 0;
    this.streakBonus = 0;
  }
}
