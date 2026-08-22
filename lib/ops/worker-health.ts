import { getRedisConnection } from "@/lib/queue/client";
import { prisma } from "@/lib/db/client";

const WORKER_HEALTH_KEY = "health:worker:dm";
const WORKER_ALERTS_KEY = "alerts:worker:dm";
const WORKER_ENABLED_KEY = "config:worker:enabled";
const WORKER_HEARTBEAT_TTL_SECONDS = 120;

export interface WorkerHeartbeat {
  status: "running";
  worker: "dm";
  pid: number;
  hostname?: string;
  startedAt?: string;
  checkedAt: string;
}

export interface WorkerHealth {
  healthy: boolean;
  enabled: boolean;
  status: "ACTIVE" | "STANDBY" | "PAUSED";
  heartbeat: WorkerHeartbeat | null;
  ageMs: number | null;
}

export interface WorkerAlert {
  level: "warning" | "error";
  message: string;
  jobId?: string;
  instagramAccountId?: string;
  commentId?: string;
  createdAt: string;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Check if background worker execution is enabled.
 * Defaults to true unless explicitly toggled off by user from website.
 */
export async function isWorkerEnabled(): Promise<boolean> {
  try {
    const redis = getRedisConnection();
    const val = await redis.get(WORKER_ENABLED_KEY);
    if (val !== null) {
      return val === "1" || val === "true";
    }

    // Fallback to database operational events for persistence across Redis restarts
    const latestEvent = await prisma.operationalEvent.findFirst({
      where: {
        source: "WORKER",
        message: { startsWith: "Worker status set to:" },
      },
      orderBy: { createdAt: "desc" },
      select: { message: true },
    });

    if (latestEvent) {
      const enabled = latestEvent.message.includes("ENABLED");
      // Cache in Redis
      await redis.set(WORKER_ENABLED_KEY, enabled ? "1" : "0");
      return enabled;
    }

    // Default to true (Active by default)
    await redis.set(WORKER_ENABLED_KEY, "1");
    return true;
  } catch (error) {
    console.error("[Worker Health] Error checking if worker enabled:", error);
    return true; // Default to enabled on network glitch so automated workflows aren't blocked
  }
}

/**
 * Turn worker ON or OFF from website.
 * State persists in Redis and PostgreSQL OperationalEvents.
 */
export async function setWorkerEnabled(
  enabled: boolean,
  actor = "website_user"
): Promise<{ enabled: boolean }> {
  const redis = getRedisConnection();
  await redis.set(WORKER_ENABLED_KEY, enabled ? "1" : "0");

  try {
    await prisma.operationalEvent.create({
      data: {
        source: "WORKER",
        level: "INFO",
        message: `Worker status set to: ${enabled ? "ENABLED" : "DISABLED"}`,
        payload: {
          actor,
          timestamp: new Date().toISOString(),
          platform: process.env.VERCEL ? "vercel-serverless" : "standard-node",
        },
      },
    });
  } catch (dbError) {
    console.error("[Worker Health] Failed to record worker state in DB:", dbError);
  }

  if (enabled) {
    // Record an immediate fresh heartbeat to show active status
    await recordWorkerHeartbeat({
      pid: process.pid || 1,
      hostname: process.env.VERCEL ? "vercel-serverless" : "local-server",
      startedAt: new Date().toISOString(),
    });
  } else {
    // Remove heartbeat key when paused
    try {
      await redis.del(WORKER_HEALTH_KEY);
    } catch {
      // ignore
    }
  }

  return { enabled };
}

export async function recordWorkerHeartbeat(
  heartbeat: Omit<WorkerHeartbeat, "checkedAt" | "status" | "worker">
) {
  const payload: WorkerHeartbeat = {
    ...heartbeat,
    status: "running",
    worker: "dm",
    checkedAt: new Date().toISOString(),
  };

  await getRedisConnection().set(
    WORKER_HEALTH_KEY,
    JSON.stringify(payload),
    "EX",
    WORKER_HEARTBEAT_TTL_SECONDS
  );
}

export async function getWorkerHealth(): Promise<WorkerHealth> {
  const enabled = await isWorkerEnabled();

  const heartbeat = parseJson<WorkerHeartbeat>(
    await getRedisConnection().get(WORKER_HEALTH_KEY)
  );

  if (!enabled) {
    return {
      healthy: false,
      enabled: false,
      status: "PAUSED",
      heartbeat: null,
      ageMs: null,
    };
  }

  if (!heartbeat) {
    return {
      healthy: false,
      enabled: true,
      status: "STANDBY",
      heartbeat: null,
      ageMs: null,
    };
  }

  const ageMs = Date.now() - new Date(heartbeat.checkedAt).getTime();
  const healthy = ageMs <= WORKER_HEARTBEAT_TTL_SECONDS * 1000;

  return {
    healthy,
    enabled: true,
    status: healthy ? "ACTIVE" : "STANDBY",
    heartbeat,
    ageMs,
  };
}

export async function recordWorkerAlert(alert: Omit<WorkerAlert, "createdAt">) {
  const payload: WorkerAlert = {
    ...alert,
    createdAt: new Date().toISOString(),
  };

  const redis = getRedisConnection();
  await redis.lpush(WORKER_ALERTS_KEY, JSON.stringify(payload));
  await redis.ltrim(WORKER_ALERTS_KEY, 0, 24);
}

export async function getWorkerAlerts(limit = 10): Promise<WorkerAlert[]> {
  const values = await getRedisConnection().lrange(
    WORKER_ALERTS_KEY,
    0,
    Math.max(0, limit - 1)
  );

  return values
    .map((value) => parseJson<WorkerAlert>(value))
    .filter((value): value is WorkerAlert => Boolean(value));
}
