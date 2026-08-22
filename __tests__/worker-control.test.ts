import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  lpush: vi.fn(),
  ltrim: vi.fn(),
  lrange: vi.fn(),
};

vi.mock("@/lib/queue/client", () => ({
  getRedisConnection: () => mockRedis,
  getDMQueue: () => ({
    getJobs: vi.fn().mockResolvedValue([]),
    getJobCounts: vi.fn().mockResolvedValue({ waiting: 0, active: 0, delayed: 0, failed: 0 }),
    add: vi.fn().mockResolvedValue({ id: "job-1" }),
  }),
  MESSAGE_JOB_NAME: "process-message",
  POSTBACK_JOB_NAME: "process-postback",
  FOLLOWUP_JOB_NAME: "process-followup",
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    operationalEvent: {
      findFirst: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: "event-1" }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    instagramAccount: {
      findUnique: vi.fn(),
    },
  },
}));

import {
  isWorkerEnabled,
  setWorkerEnabled,
  getWorkerHealth,
} from "@/lib/ops/worker-health";

describe("Worker Control & Health State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isWorkerEnabled", () => {
    it("returns true when Redis key is '1' or 'true'", async () => {
      mockRedis.get.mockResolvedValueOnce("1");
      const enabled = await isWorkerEnabled();
      expect(enabled).toBe(true);
    });

    it("returns false when Redis key is '0' or 'false'", async () => {
      mockRedis.get.mockResolvedValueOnce("0");
      const enabled = await isWorkerEnabled();
      expect(enabled).toBe(false);
    });

    it("defaults to true when Redis key is unset and no DB event exists", async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      const { prisma } = await import("@/lib/db/client");
      (prisma.operationalEvent.findFirst as any).mockResolvedValueOnce(null);

      const enabled = await isWorkerEnabled();
      expect(enabled).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith("config:worker:enabled", "1");
    });
  });

  describe("setWorkerEnabled", () => {
    it("sets Redis key and DB event when turning worker ON", async () => {
      const result = await setWorkerEnabled(true, "test_user");
      expect(result.enabled).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith("config:worker:enabled", "1");
      expect(mockRedis.set).toHaveBeenCalledWith(
        "health:worker:dm",
        expect.any(String),
        "EX",
        120
      );
    });

    it("sets Redis key and deletes heartbeat when turning worker OFF", async () => {
      const result = await setWorkerEnabled(false, "test_user");
      expect(result.enabled).toBe(false);
      expect(mockRedis.set).toHaveBeenCalledWith("config:worker:enabled", "0");
      expect(mockRedis.del).toHaveBeenCalledWith("health:worker:dm");
    });
  });

  describe("getWorkerHealth", () => {
    it("returns status PAUSED when worker is disabled", async () => {
      mockRedis.get.mockResolvedValueOnce("0"); // worker disabled
      mockRedis.get.mockResolvedValueOnce(null); // heartbeat

      const health = await getWorkerHealth();
      expect(health.enabled).toBe(false);
      expect(health.status).toBe("PAUSED");
      expect(health.healthy).toBe(false);
    });

    it("returns status ACTIVE when worker is enabled and heartbeat is fresh", async () => {
      mockRedis.get.mockResolvedValueOnce("1"); // worker enabled
      mockRedis.get.mockResolvedValueOnce(
        JSON.stringify({
          status: "running",
          worker: "dm",
          pid: 1234,
          checkedAt: new Date().toISOString(),
        })
      );

      const health = await getWorkerHealth();
      expect(health.enabled).toBe(true);
      expect(health.status).toBe("ACTIVE");
      expect(health.healthy).toBe(true);
    });
  });
});
