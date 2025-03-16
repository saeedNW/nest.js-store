import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
	constructor(@Inject('REDIS_CONNECTION') private readonly redis: Redis) { }

	/**
	 * Sets a key-value pair in Redis with a TTL (Time-to-Live) expiration.
	 * @param {string} name - The key to set in Redis.
	 * @param {string} value - The value to associate with the key.
	 * @param {number} ttl - The TTL (in seconds) for the key.
	 * @returns {Promise<string>} - The status of the set operation (e.g., "OK").
	 */
	async set(name: string, value: string, ttl: number): Promise<string> {
		return await this.redis.set(name, value, 'EX', ttl);
	}

	/**
	 * Retrieves the value associated with a key from Redis.
	 * @param {string} name - The key to retrieve from Redis.
	 * @returns {Promise<string | null>} - The value associated with the key, or null if the key does not exist.
	 */
	async get(name: string): Promise<string | null> {
		return await this.redis.get(name);
	}

	/**
	 * Deletes a key from Redis.
	 * @param {string} name - The key to delete from Redis.
	 * @returns {Promise<number>} - The number of keys that were removed (0 or 1).
	 */
	async del(name: string): Promise<number> {
		return await this.redis.del(name);
	}
}
