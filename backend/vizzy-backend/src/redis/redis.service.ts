import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

/**
 * Service responsible for managing the Redis client connection.
 * It reads connection details from environment variables and establishes
 * a connection, handling both TLS (e.g., Upstash) and non-TLS (e.g., local Docker) scenarios.
 */
@Injectable()
export class RedisService {
  set(cacheKey: string, arg1: string, arg2: { ex: number }) {
    throw new Error('Method not implemented.');
  }
  del(cacheKey: string) {
    throw new Error('Method not implemented.');
  }
  get(cacheKey: string) {
    throw new Error('Method not implemented.');
  }
  private readonly redisClient: Redis;

  /**
   * Initializes the RedisService.
   * Reads REDIS_HOST, REDIS_PASSWORD, and REDIS_PORT from environment variables.
   * Establishes a connection to the Redis server using ioredis.
   * Throws an error if essential environment variables (host, port) are missing.
   * Logs connection status and errors.
   */
  constructor() {
    const redisHost = process.env.REDIS_HOST;
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;

    if (!redisHost || !redisPort) {
      throw new Error(
        'Redis host and port environment variables must be defined',
      );
    }

    // Determine connection options based on whether a password is provided
    // (password presence implies a cloud/TLS connection like Upstash)
    let connectionString: string;
    const options: RedisOptions = {};

    if (redisPassword) {
      connectionString = `rediss://default:${redisPassword}@${redisHost}:${redisPort}`;
    } else {
      // Assume non-TLS for connections without password (default local Docker)
      connectionString = `redis://${redisHost}:${redisPort}`;
    }

    console.log(
      `Connecting to Redis: ${redisHost}:${redisPort} (TLS: ${!!redisPassword})`,
    );

    this.redisClient = new Redis(connectionString, options);

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    this.redisClient.on('connect', () => {
      console.log('Successfully connected to Redis');
    });
  }

  /**
   * Retrieves the underlying ioredis client instance.
   * @returns {Redis} The configured ioredis client instance.
   */
  getRedisClient(): Redis {
    return this.redisClient;
  }
}
