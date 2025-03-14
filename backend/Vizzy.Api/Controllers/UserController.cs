using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Supabase;
using Vizzy.Api.Models.UserManagement;
using static Supabase.Postgrest.Constants;

namespace Vizzy.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class UsersController : ControllerBase {
    private readonly Client _supabaseClient;
    private readonly ILogger<UsersController> _logger;
    private readonly IMemoryCache _cache;

    public UsersController(Client supabaseClient, ILogger<UsersController> logger,
                           IMemoryCache cache) {
      _supabaseClient = supabaseClient;
      _logger = logger;
      _cache = cache;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> getUser(Guid id) {
      if (id == Guid.Empty) {
        return BadRequest(new { message = "ID inválido" });
      }

      string cacheKey = $"user_{id}";

      // Try to get the user from cache
      if (_cache.TryGetValue(cacheKey, out object cachedUser)) {
        return Ok(cachedUser);
      }

      try {
        var result = await _supabaseClient.Rpc(
            "get_basic_user_info", new Dictionary<string, object> { { "user_uuid", id } });

        if (result == null) {
          return NotFound(new { message = "Utilizador não encontrado" });
        }

        // Cache the result for 1 hour
        var cacheOptions =
            new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) };

        _cache.Set(cacheKey, result.Content, cacheOptions);

        return Ok(result.Content);
      } catch {
        return BadRequest(new { message = "Erro desconhecido" });
      }
    }
  }
}
