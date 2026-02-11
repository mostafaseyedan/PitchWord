interface Job {
  runId: string;
}

export class InMemoryJobQueue {
  private queue: Job[] = [];
  private inFlight = false;

  constructor(private readonly worker: (job: Job) => Promise<void>) {}

  enqueue(job: Job): void {
    this.queue.push(job);
    this.pump().catch((error: unknown) => {
      console.error("Queue pump error", error);
    });
  }

  getSize(): number {
    return this.queue.length + (this.inFlight ? 1 : 0);
  }

  private async pump(): Promise<void> {
    if (this.inFlight) {
      return;
    }
    this.inFlight = true;

    try {
      while (this.queue.length > 0) {
        const next = this.queue.shift();
        if (!next) {
          continue;
        }
        await this.worker(next);
      }
    } finally {
      this.inFlight = false;
    }
  }
}
