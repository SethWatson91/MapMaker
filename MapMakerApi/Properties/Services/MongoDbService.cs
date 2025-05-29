using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class MongoDbService
{
    private readonly IMongoDatabase _database;
    public MongoDbService(IConfiguration config)
    {
        var connectionString = config["MONGODB_CONNECTION_STRING"];
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new ArgumentNullException(nameof(connectionString), "MongoDB connection string is missing in configuration.");
        }
        var client = new MongoClient(connectionString);
        var dbName = config["MONGODB_DATABASE_NAME"];
        if (string.IsNullOrEmpty(dbName))
        {
            throw new ArgumentNullException(nameof(dbName), "MongoDB database name is missing in configuration.");
        }
        _database = client.GetDatabase(dbName);
    }
    public IMongoCollection<Map> Maps => _database.GetCollection<Map>("maps");
}

public class Map
{
    [BsonId]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string? Name { get; set; }

    [BsonElement("layers")]
    public List<Marker>? Layers { get; set; }

    [BsonElement("creator")]
    public string? Creator { get; set; }
}

public class Marker
{
    [BsonElement("lat")]
    public double Lat { get; set; }

    [BsonElement("lng")]
    public double Lng { get; set; }

    [BsonElement("name")]
    public string? Name { get; set; }
}