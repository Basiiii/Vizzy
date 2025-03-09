using Microsoft.AspNetCore.Mvc;
using Supabase;
using Vizzy.Api.Models.UserManagement;

namespace Vizzy.Api.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class UsersController : ControllerBase {
    private readonly Client _supabaseClient;
    private readonly ILogger<UsersController> _logger;

    public UsersController(Client supabaseClient, ILogger<UsersController> logger) {
      _supabaseClient = supabaseClient;
      _logger = logger;
    }
  }
}
