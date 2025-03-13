using Microsoft.AspNetCore.Mvc;
using Vizzy.Api.Interfaces;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace Vizzy.Api.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly HttpClient _httpClient;
        private readonly string _redisUrl = "https://social-hamster-61656.upstash.io";
        private readonly string _upstashPassword = "AfDYAAIjcDEzN2E5M2RjZjBhNGY0YWQzYjE4ZTU4ODI5ZDFlNDY3YXAxMA";

        public RedisCacheService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }


        [HttpPost("setCache")]
        public async Task<IActionResult> SetCache(string key, object jsonValue)
        {
            if (string.IsNullOrEmpty(key) || jsonValue == null)
            {
                return new BadRequestObjectResult(new { message = "Invalid key or value" });
            }

            var requestUrl = $"{_redisUrl}/set/{key}/{jsonValue}";

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl);
            httpRequest.Headers.Add("Authorization", $"Bearer {_upstashPassword}");

            var response = await _httpClient.SendAsync(httpRequest);

            if (response.IsSuccessStatusCode)
            {
                return new OkObjectResult(new { message = "Cache set successfully" });
            }

            return new BadRequestObjectResult(new { message = "Failed to set cache" });
        }

        [HttpPost("getCache")]
        public async Task<IActionResult> GetCache(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return new BadRequestObjectResult(new { message = "Invalid key" });
            }

            var requestUrl = $"{_redisUrl}/get/{key}";

            var httpRequest = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            httpRequest.Headers.Add("Authorization", $"Bearer {_upstashPassword}");

            var response = await _httpClient.SendAsync(httpRequest);
            Console.WriteLine($"Response Status: {response.StatusCode}");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Content: {content}");

                var jsonObject = JsonSerializer.Deserialize<JsonElement>(content);

                if (jsonObject.TryGetProperty("result", out var result))
                {
                    if (result.ValueKind == JsonValueKind.Null || result.ValueKind != JsonValueKind.String)
                    {
                        return new NotFoundObjectResult(new { message = "Cache key not found" });
                    }
                    else
                    {
                        var resultObject = JsonSerializer.Deserialize<JsonElement>(result.GetString());
                        if (jsonObject.TryGetProperty("result", out var finalResult) && result.ValueKind == JsonValueKind.String)
                        {
                            var finalObject = JsonSerializer.Deserialize<JsonElement>(finalResult.GetString());
                            return new OkObjectResult(finalObject);
                        }

                        return new OkObjectResult(resultObject.ToString());
                    }
                }

                return new BadRequestObjectResult(new { message = "Failed to get cache" });
            }
            return new BadRequestObjectResult(new { message = "Failed to get cache" });
        }
    }
}
