namespace Vizzy.Api.Interfaces
{
    /// <summary>
    /// Interface that defines caching operations.
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Stores a value in the Redis cache with an expiration time.
        /// </summary>
        /// <param name="key">The cache key.</param>
        /// <param name="value">The value to store.</param>
        /// <param name="expiration">The expiration time for the cache entry.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        Task SetAsync(string key, string value, TimeSpan expiration);

        /// <summary>
        /// Retrieves a value from the Redis cache.
        /// </summary>
        /// <param name="key">The cache key.</param>
        /// <returns>The cached value, or null if the key does not exist.</returns>
        Task<string?> GetAsync(string key);
    }
}
