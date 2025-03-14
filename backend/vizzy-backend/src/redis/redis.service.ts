import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    const redisHost = process.env.REDIS_HOST;
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisPort = parseInt(process.env.REDIS_PORT!, 10) || 6379;

    this.redisClient = new Redis(
      `rediss://default:${redisPassword}@${redisHost}:${redisPort}`,
    );
  }

  getRedisClient(): Redis {
    return this.redisClient;
  }
}
