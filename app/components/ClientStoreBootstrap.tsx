"use client";

import { useStoreHydration } from "../hooks/useStoreHydration";
import { useStorePersistence } from "../hooks/useStorePersistence";

export function ClientStoreBootstrap() {
  useStoreHydration();
  useStorePersistence();

  return null;
}
