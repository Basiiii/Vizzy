using Microsoft.AspNetCore.Mvc;

namespace Vizzy.Api.Interfaces
{
    public interface ICacheService
    {
        public Task<IActionResult> SetCache(string key, object jsonValue);

        public Task<IActionResult> GetCache(string key);
    }
}
