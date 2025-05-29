using DotNetEnv;
using System.IO;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
Console.WriteLine($"Looking for .env file at: {envPath}");
Console.WriteLine($".env file exists: {File.Exists(envPath)}");

Env.Load(envPath);

var mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
var mongoDbName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME");
Console.WriteLine($"Env MONGODB_CONNECTION_STRING: {(string.IsNullOrEmpty(mongoConnectionString) ? "null" : "set")}");
Console.WriteLine($"Env MONGODB_DATABASE_NAME: {(string.IsNullOrEmpty(mongoDbName) ? "null" : "set")}");

var builder = WebApplication.CreateBuilder(args);

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin() // Allow all origins (including http://localhost:3000)
               .AllowAnyMethod() // Allow GET, POST, etc.
               .AllowAnyHeader(); // Allow all headers (e.g., Content-Type)
    });
});

builder.Services.AddControllers();
builder.Configuration.AddEnvironmentVariables();

Console.WriteLine($"Config MONGODB_CONNECTION_STRING: {(string.IsNullOrEmpty(builder.Configuration["MONGODB_CONNECTION_STRING"]) ? "null" : "set")}");
Console.WriteLine($"Config MONGODB_DATABASE_NAME: {(string.IsNullOrEmpty(builder.Configuration["MONGODB_DATABASE_NAME"]) ? "null" : "set")}");

builder.Services.AddSingleton<MongoDbService>();

var app = builder.Build();

// Enable CORS middleware
app.UseRouting();
app.UseCors("AllowAll"); // Must be before UseAuthorization and MapControllers
app.UseAuthorization();
app.MapControllers();

app.Run();