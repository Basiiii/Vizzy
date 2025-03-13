using Microsoft.AspNetCore.Mvc;
using Supabase;
using Vizzy.Api.Models.UserManagement;
using static Supabase.Postgrest.Constants;
using StackExchange.Redis;
using System.Text.Json;

namespace Vizzy.Api.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly Client _supabaseClient;
        private readonly ILogger<UsersController> _logger;
        private readonly IDatabase _cache;

        public UsersController(Client supabaseClient, ILogger<UsersController> logger, IConnectionMultiplexer redis)
        {
            _supabaseClient = supabaseClient;
            _logger = logger;
            _cache = redis.GetDatabase();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> getUser(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new { message = "ID inválido" });
            }

            string cacheKey = $"user:{id}";

            try
            {
                //Try to get the user from the cache
                var cachedUser = await _cache.StringGetAsync(cacheKey);
                if (!cachedUser.IsNullOrEmpty)
                {
                    _logger.LogInformation($"User {id} found in cache");

                    var cachedData = cachedUser.ToString();
                    //Make sure the cached data is not empty or null
                    if (!string.IsNullOrEmpty(cachedUser))
                    {
                        return Ok(JsonSerializer.Deserialize<object>(cachedUser));
                    }
                }

                //If the user is not in the cache, fetch it from the database
                var result = await _supabaseClient.Rpc("get_basic_user_info", new Dictionary<string, object> { { "user_uuid", id} });
                Console.WriteLine(result.ToString());
                if (result == null)
                {
                    return NotFound(new { message = "Utilizador não encontrado" });
                }

                //Store the user in the cache for 10 minutes
                await _cache.StringSetAsync(cacheKey, JsonSerializer.Serialize(result.Content), TimeSpan.FromMinutes(10));

                return Ok(result.Content);
            }
            catch
            {
                _logger.LogError("An error occurred while fetching user data");
                return BadRequest(new { message = "Erro desconhecido" });
            }
           
        }
    }
}
