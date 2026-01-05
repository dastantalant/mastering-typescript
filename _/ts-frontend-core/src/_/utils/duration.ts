export default class DurationUtil {
    private getTimeComponents(ms: number): { hours: number; minutes: number; seconds: number } {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { hours, minutes, seconds };
    }

    private formatTimeUnit(value: number): string {
        return String(value).padStart(2, '0');
    }

    convertMillisToHHMM(ms: number): string {
        const { hours, minutes } = this.getTimeComponents(ms);
        return `${this.formatTimeUnit(hours)}:${this.formatTimeUnit(minutes)}`;
    }

    convertMillisToMMSS(ms: number): string {
        const { minutes, seconds } = this.getTimeComponents(ms);
        return `${this.formatTimeUnit(minutes)}:${this.formatTimeUnit(seconds)}`;
    }

    convertMillisToHHMMSS(ms: number): string {
        const { hours, minutes, seconds } = this.getTimeComponents(ms);

        if (hours > 0) {
            return `${this.formatTimeUnit(hours)}:${this.formatTimeUnit(minutes)}:${this.formatTimeUnit(seconds)}`;
        } else {
            return `${this.formatTimeUnit(minutes)}:${this.formatTimeUnit(seconds)}`;
        }
    }
}