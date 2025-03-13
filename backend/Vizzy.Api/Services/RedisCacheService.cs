using StackExchange.Redis;
using Vizzy.Api.Interfaces;

namespace Vizzy.Api.Services
{
    /// <summary>
    /// Implementation of the Redis cache service using StackExchange.Redis.
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDatabase _cache;
        /// <summary>
        /// Initializes a new instance of the <see cref="RedisCacheService"/> class.
        /// </summary>
        /// <param name="redis">The Redis connection multiplexer.</param>
        public RedisCacheService(IConnectionMultiplexer redis)
        {
            _cache = redis.GetDatabase();
        }
        /// <summary>
        /// Stores a value in Redis with a given expiration time.
        /// </summary>
        /// <param name="key">The key under which the value is stored.</param>
        /// <param name="value">The value to store.</param>
        /// <param name="expiration">The time after which the cache entry expires.</param>
        public async Task SetAsync(string key, string value, TimeSpan expiration)
        {
            await _cache.StringSetAsync(key, value, expiration);
        }
        /// <summary>
        /// Retrieves a value from Redis by its key.
        /// </summary>
        /// <param name="key">The key to look up.</param>
        /// <returns>The stored value, or null if not found.</returns>
        public async Task<string?> GetAsync(string key)
        {
            return await _cache.StringGetAsync(key);
        }
    }
}
