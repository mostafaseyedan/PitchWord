import { EventEmitter } from "node:events";
import type { AgentStepLog, EventMessage, Run } from "@marketing/shared";

export class AppEventBus extends EventEmitter {
  publishRunUpdated(run: Run): void {
    const message: EventMessage = {
      type: "run_updated",
      payload: run
    };
    this.emit("event", message);
  }

  publishLogAdded(log: AgentStepLog): void {
    const message: EventMessage = {
      type: "log_added",
      payload: log
    };
    this.emit("event", message);
  }
}
