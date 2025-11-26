using Explorer.API.Middleware;
using Explorer.API.Startup;
using Explorer.Stakeholders.API.Public;
using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using Explorer.Stakeholders.Core.UseCases;
using Explorer.Stakeholders.Infrastructure.Database.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Neo4j.Driver;
using System.Text;

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
builder.Services.AddGrpc();
builder.Services.ConfigureSwagger(builder.Configuration);
const string corsPolicy = "_corsPolicy";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5001, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2;
    });

    options.ListenAnyIP(8080, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http1;
    });
});
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
app.MapGrpcService<UserNodeService>();

app.Run();

// Required for automated tests
namespace Explorer.API
{
    public partial class Program { }
}