using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

[Route("api/[controller]")]
[ApiController]
public class MapsController : ControllerBase
{
    private readonly MongoDbService _mongoDbService;
    public MapsController(MongoDbService mongoDbService)
    {
        _mongoDbService = mongoDbService;
    }

    [HttpGet("test")]
    public async Task<IActionResult> TestConnection()
    {
        var maps = await _mongoDbService.Maps.Find(_ => true).ToListAsync();
        return Ok(maps);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMap([FromBody] Map map)
    {
        if (map == null || string.IsNullOrEmpty(map.Id) || string.IsNullOrEmpty(map.Name))
        {
            return BadRequest("Map data is invalid. ID and Name are required.");
        }

        // Check if a map with the same ID already exists
        var existingMap = await _mongoDbService.Maps
            .Find(m => m.Id == map.Id)
            .FirstOrDefaultAsync();

        if (existingMap != null)
        {
            return Conflict($"A map with ID {map.Id} already exists.");
        }

        await _mongoDbService.Maps.InsertOneAsync(map);
        return CreatedAtAction(nameof(TestConnection), new { id = map.Id }, map);
    }
}

