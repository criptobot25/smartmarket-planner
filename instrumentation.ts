import { logServerEvent } from "./app/lib/serverLogger";

let handlersRegistered = false;

export async function register() {
  if (handlersRegistered) {
    return;
  }

  handlersRegistered = true;

  if (typeof process === "undefined" || typeof process.on !== "function") {
    return;
  }

  process.on("uncaughtException", (error: Error) => {
    logServerEvent("error", "uncaught_exception", {
      error,
    });
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logServerEvent("error", "unhandled_rejection", {
      reason,
    });
  });

  logServerEvent("info", "instrumentation_registered");
}
