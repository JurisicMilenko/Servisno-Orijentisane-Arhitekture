using Explorer.API.Middleware;
using Explorer.API.Startup;
using Explorer.Stakeholders.API.Public;
using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using Explorer.Stakeholders.Core.UseCases;
using Explorer.Stakeholders.Infrastructure.Database.Repositories;
using Neo4j.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IDriver>(sp =>
{
    var boltUri = Environment.GetEnvironmentVariable("NEO4J_BOLT_URI")
                  ?? "bolt://localhost:7687";

    var username = Environment.GetEnvironmentVariable("NEO4J_USERNAME")
                   ?? "neo4j";

    var password = Environment.GetEnvironmentVariable("NEO4J_PASSWORD")
                   ?? "super123";

    return GraphDatabase.Driver(boltUri, AuthTokens.Basic(username, password));
});

builder.Services.AddScoped<IFollowersRepository, FollowersDbRepository>();
builder.Services.AddScoped<IFollowersService, FollowersService>();

builder.Services.AddControllers();
builder.Services.ConfigureSwagger(builder.Configuration);
const string corsPolicy = "_corsPolicy";
builder.Services.ConfigureCors(corsPolicy);
builder.Services.ConfigureAuth();

builder.Services.RegisterModules();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseRouting();
app.UseCors(corsPolicy);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Required for automated tests
namespace Explorer.API
{
    public partial class Program { }
}