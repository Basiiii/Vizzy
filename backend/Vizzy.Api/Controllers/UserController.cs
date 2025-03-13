using Microsoft.AspNetCore.Mvc;
using Supabase;
using Vizzy.Api.Models.UserManagement;
using static Supabase.Postgrest.Constants;
using Vizzy.Api.Services;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Vizzy.Api.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly Client _supabaseClient;
        private readonly ILogger<UsersController> _logger;
        private readonly RedisCacheService _redisCacheService;

        public UsersController(Client supabaseClient, ILogger<UsersController> logger, RedisCacheService redisCacheService)
        {
            _supabaseClient = supabaseClient;
            _logger = logger;
            _redisCacheService = redisCacheService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> getUser(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new { message = "ID inválido" });
            }
            string cacheKey= $"user:{id}";

            try
            {
               
                var cachedUser = await _redisCacheService.GetCache(cacheKey);
                var control = cachedUser.ToString();
                if (!((cachedUser is NotFoundObjectResult) || (cachedUser is BadRequestObjectResult)))
                {
                    return Ok(JsonHttpResult);
                }
                else
                {
                    var result = await _supabaseClient.Rpc("get_basic_user_info", new Dictionary<string, object> { { "user_uuid", id } });
                    Console.WriteLine(result.ToString());
                    if (result == null|| result.Content==null)
                    {
                        return NotFound(new { message = "Utilizador não encontrado" });
                    }
                    await _redisCacheService.SetCache(cacheKey, result.Content);

                    return Ok(result.Content);
                }
                
            }
            catch
            {
                return BadRequest(new { message = "Erro desconhecido" });
            }
           
        }
    }
}
