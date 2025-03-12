using Microsoft.AspNetCore.Mvc;
using Supabase;
using Vizzy.Api.Models.UserManagement;
using static Supabase.Postgrest.Constants;

namespace Vizzy.Api.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly Client _supabaseClient;
        private readonly ILogger<UsersController> _logger;

        public UsersController(Client supabaseClient, ILogger<UsersController> logger)
        {
            _supabaseClient = supabaseClient;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> getUser(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new { message = "ID inválido" });
            }

            try
            {
                var result = await _supabaseClient.Rpc("get_basic_user_info", new Dictionary<string, object> { { "user_uuid", id} });
                Console.WriteLine(result.ToString());
                if (result == null)
                {
                    return NotFound(new { message = "Utilizador não encontrado" });
                }
                
               
                return Ok(result.Content);
            }
            catch
            {
                return BadRequest(new { message = "Erro desconhecido" });
            }
           
        }
    }
}
