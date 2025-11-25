using Explorer.Stakeholders.Core.Domain;
using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using Neo4j.Driver;
using System.Collections.Generic;
using Explorer.Stakeholders.API.Dtos;

namespace Explorer.Stakeholders.Infrastructure.Database.Repositories
{
    public class FollowersDbRepository : IFollowersRepository
    {
        private readonly IDriver _driver;

        public FollowersDbRepository(IDriver driver)
        {
            _driver = driver;
        }

        public async Task Follow(long followerId, long targetId)
        {
            var query = @"
                MERGE (f:User {id:$followerId})
                MERGE (t:User {id:$targetId})
                MERGE (f)-[:FOLLOWS]->(t)";

            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(tx =>
                tx.RunAsync(query, new { followerId, targetId })
            );
        }

        public async Task Unfollow(long followerId, long targetId)
        {
            var query = @"
            MATCH (f:User {id:$followerId})-[r:FOLLOWS]->(t:User {id:$targetId})
            DELETE r";

            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(tx =>
                tx.RunAsync(query, new { followerId, targetId })
            );
        }

        public async Task<List<long>> GetFollowers(long userId)
        {
            var query = @"
            MATCH (f:User)-[:FOLLOWS]->(t:User {id:$userId})
            RETURN f.id AS id";

            await using var session = _driver.AsyncSession();

            var result = await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { userId });
                var records = await cursor.ToListAsync();
                return records.ConvertAll(r => r["id"].As<long>());
            });

            return result;
        }

        public async Task<List<long>> GetFollowing(long userId)
        {
            var query = @"
            MATCH (u:User {id:$userId})-[:FOLLOWS]->(followed:User)
            RETURN followed.id AS id";

            await using var session = _driver.AsyncSession();

            var result = await session.ExecuteReadAsync(async tx =>
            {
                var cursor = await tx.RunAsync(query, new { userId });
                var records = await cursor.ToListAsync();
                return records.ConvertAll(r => r["id"].As<long>());
            });

            return result;
        }

        public async Task<List<UserNodeDTO>> GetSuggestedFollowers(long userId)
        {
            await using var session = _driver.AsyncSession();

            var result = await session.ExecuteReadAsync(async tx =>
            {
                var followCheck = await tx.RunAsync(
                    "MATCH (:User {id:$userId})-[:FOLLOWS]->(x) RETURN x LIMIT 1",
                    new { userId }
                );
                bool followsAnyone = await followCheck.PeekAsync() != null;

                string query;

                if (followsAnyone)
                {
                    query = @"
                    MATCH (me:User {id:$userId})-[:FOLLOWS]->(:User)<-[:FOLLOWS]-(u:User)
                    WHERE u.id <> $userId
                      AND NOT (me)-[:FOLLOWS]->(u)
                    RETURN DISTINCT u.id AS id, u.username AS username, u.role AS role
                    LIMIT 20";
                }
                else
                {
                    query = @"
                    MATCH (u:User)
                    WHERE u.id <> $userId
                    RETURN u.id AS id, u.username AS username, u.role AS role
                    LIMIT 20";
                }

                var cursor = await tx.RunAsync(query, new { userId });
                var records = await cursor.ToListAsync();

                return records.ConvertAll(r => new UserNodeDTO(
                    r["id"].As<long>(),
                    r["username"].As<string>(),
                    r["role"].As<string>()
                ));
            });


            return result;
        }
    }
}
