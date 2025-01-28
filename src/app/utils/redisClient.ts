import Redis from "ioredis";
import config from "../config";

const redis_client = new Redis({
  host: config.redis_host || "redis",
  port: parseInt(config.redis_port || "6379"),
});

export default redis_client;
