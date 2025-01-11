import { EntityManager } from "./managers/entity-manager";
import { MapManager } from "./managers/map-manager";
import { ServerSocketManager } from "./managers/server-socket-manager";
import { GameStateEvent } from "./shared/events/server-sent";
import { GameOverEvent } from "./shared/events/server-sent/game-over-event";

export const FPS = 30;

export const DAY_DURATION = 1;
export const NIGHT_DURATION = 100;

const PERFORMANCE_LOG_INTERVAL = 5000; // Log every 5 seconds
const TICK_RATE_MS = 1000 / FPS; // ~33.33ms for 30 FPS

export class GameServer {
  private lastUpdateTime: number = Date.now();
  private entityManager: EntityManager;
  private mapManager: MapManager;
  private socketManager: ServerSocketManager;
  private timer: ReturnType<typeof setInterval> | null = null;
  private updateTimes: number[] = [];
  private lastPerformanceLog: number = Date.now();
  private isGameOver: boolean = false;

  // game state
  public dayNumber: number = 1;
  public untilNextCycle: number = 0;
  public isDay: boolean = true;

  constructor(port: number = 3001) {
    this.socketManager = new ServerSocketManager(port, this);
    this.entityManager = new EntityManager(this.socketManager);

    this.mapManager = new MapManager(this.entityManager);
    this.mapManager.setSocketManager(this.socketManager);

    this.socketManager.setEntityManager(this.entityManager);
    this.socketManager.setMapManager(this.mapManager);
    this.socketManager.listen();

    this.startGameLoop();
  }

  public startNewGame(): void {
    this.isGameOver = false;
    this.dayNumber = 1;
    this.untilNextCycle = DAY_DURATION;
    this.isDay = true;
    this.mapManager.generateMap();
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private startGameLoop(): void {
    this.timer = setInterval(() => {
      this.update();
    }, 1000 / FPS);
  }

  private onDayStart(): void {
    console.log("Day started");
  }

  private onNightStart(): void {
    console.log("Night started");
    this.mapManager.spawnZombies(this.dayNumber);
  }

  public setIsGameOver(isGameOver: boolean): void {
    this.isGameOver = isGameOver;
  }

  private update(): void {
    // setup
    const updateStartTime = performance.now();
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;

    // logic
    if (this.isGameOver) {
      return;
    }

    this.updateEntities(deltaTime);

    this.handleDayNightCycle(deltaTime);
    this.handleIfGameOver();

    // cleanup
    this.entityManager.pruneEntities();
    this.socketManager.broadcastGameState();
    this.trackPerformance(updateStartTime, currentTime);
    this.lastUpdateTime = currentTime;
  }

  private handleDayNightCycle(deltaTime: number) {
    this.untilNextCycle -= deltaTime;
    if (this.untilNextCycle <= 0) {
      this.isDay = !this.isDay;
      this.untilNextCycle = this.isDay ? DAY_DURATION : NIGHT_DURATION;
      this.dayNumber += this.isDay ? 1 : 0;

      if (this.isDay) {
        this.onDayStart();
      } else {
        this.onNightStart();
      }
    }
  }

  private handleIfGameOver(): void {
    const players = this.entityManager.getPlayerEntities();
    if (players.length > 0 && players.every((player) => player.isDead())) {
      this.endGame();
    }
  }

  private endGame(): void {
    console.log("Game over");
    this.isGameOver = true;
    this.socketManager.broadcastEvent(new GameOverEvent());
  }

  private trackPerformance(updateStartTime: number, currentTime: number) {
    const updateDuration = performance.now() - updateStartTime;
    this.updateTimes.push(updateDuration);

    // Warn if update took longer than tick rate
    if (updateDuration > TICK_RATE_MS) {
      console.warn(
        `Warning: Slow update detected - took ${updateDuration.toFixed(
          2
        )}ms (>${TICK_RATE_MS.toFixed(2)}ms threshold)`
      );
    }

    // Log performance stats every PERFORMANCE_LOG_INTERVAL ms
    if (currentTime - this.lastPerformanceLog > PERFORMANCE_LOG_INTERVAL) {
      const avgUpdateTime = this.updateTimes.reduce((a, b) => a + b, 0) / this.updateTimes.length;
      const maxUpdateTime = Math.max(...this.updateTimes);
      const slowUpdates = this.updateTimes.filter((time) => time > TICK_RATE_MS).length;
      console.log(`Performance stats:
        Avg update time: ${avgUpdateTime.toFixed(2)}ms
        Max update time: ${maxUpdateTime.toFixed(2)}ms
        Total Entities: ${this.entityManager.getEntities().length}
        Updates tracked: ${this.updateTimes.length}
        Slow updates: ${slowUpdates} (${((slowUpdates / this.updateTimes.length) * 100).toFixed(
        1
      )}%)
      `);

      // Reset tracking
      this.updateTimes = [];
      this.lastPerformanceLog = currentTime;
    }
  }

  private updateEntities(deltaTime: number): void {
    this.entityManager.update(deltaTime);
  }
}

const gameServer = new GameServer();

process.on("SIGINT", () => gameServer.stop());
