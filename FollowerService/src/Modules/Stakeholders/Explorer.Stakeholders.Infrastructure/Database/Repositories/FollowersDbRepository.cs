using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using System.Collections.Generic;
using Neo4j.Driver;

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
    }
}
