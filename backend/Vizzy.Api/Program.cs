using Supabase;
using StackExchange.Redis;
using Vizzy.Api.Interfaces;
using Vizzy.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Initialize Supabase
var url = Environment.GetEnvironmentVariable("SUPABASE_URL") ??
          throw new InvalidOperationException("SUPABASE_URL is not set.");
var key = Environment.GetEnvironmentVariable("SUPABASE_KEY") ??
          throw new InvalidOperationException("SUPABASE_KEY is not set.");
var options = new SupabaseOptions {
  AutoRefreshToken = true,
  AutoConnectRealtime = true,
};

// Initialize Redis
string redisConnection = builder.Configuration.GetSection("Redis")["ConnectionString"] /*+ ",abortConnect=false"*/ ??
                        throw new InvalidOperationException("Redis connection string is missing!");

// Add services to the container.
builder.Services.AddSingleton(provider => new Supabase.Client(url, key, options));
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnection));
builder.Services.AddScoped<ICacheService, RedisCacheService>();

// Add controllers and other services.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers().AddNewtonsoftJson();

builder.Services.AddCors(options => {
  options.AddPolicy("AllowLocalhost3000", policy => {
    policy.WithOrigins("http://localhost:3000")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
  });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
