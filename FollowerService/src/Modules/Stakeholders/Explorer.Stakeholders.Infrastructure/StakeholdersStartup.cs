using Explorer.BuildingBlocks.Infrastructure.Database;
using Explorer.Stakeholders.API.Public;
using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using Explorer.Stakeholders.Core.Mappers;
using Explorer.Stakeholders.Core.UseCases;
using Explorer.Stakeholders.Infrastructure.Database;
using Explorer.Stakeholders.Infrastructure.Database.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Explorer.Stakeholders.Infrastructure;

public static class StakeholdersStartup
{
    public static IServiceCollection ConfigureStakeholdersModule(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(StakeholderProfile).Assembly);

        // Neo4j Followers Graph Registration
        services.AddSingleton(new FollowersContext("bolt://localhost:7687", "neo4j", "password"));

        SetupCore(services);
        SetupInfrastructure(services);

        return services;
    }

    private static void SetupCore(IServiceCollection services)
    {
        services.AddScoped<IFollowersService, FollowersService>();
    }

    private static void SetupInfrastructure(IServiceCollection services)
    {
        services.AddScoped<IFollowersRepository, FollowersDbRepository>();
    }
}
