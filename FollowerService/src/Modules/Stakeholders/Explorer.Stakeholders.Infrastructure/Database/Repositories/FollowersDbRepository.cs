using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.Infrastructure.Database.Repositories
{
    public class FollowersDbRepository : IFollowersRepository
    {
        private readonly FollowersContext _context;

        public FollowersDbRepository(FollowersContext context)
        {
            _context = context;
        }

        public void Follow(long followerId, long targetId)
        {
            using var session = _context.Driver.Session();
            session.Run(
                "MERGE (f:User {id:$followerId}) " +
                "MERGE (t:User {id:$targetId}) " +
                "MERGE (f)-[:FOLLOWS]->(t)",
                new { followerId, targetId }
            );
        }

        public void Unfollow(long followerId, long targetId)
        {
            using var session = _context.Driver.Session();
            session.Run(
                "MATCH (f:User {id:$followerId})-[r:FOLLOWS]->(t:User {id:$targetId}) " +
                "DELETE r",
                new { followerId, targetId }
            );
        }

        public List<long> GetFollowers(long userId)
        {
            using var session = _context.Driver.Session();
            var result = session.Run(
                "MATCH (f:User)-[:FOLLOWS]->(t:User {id:$userId}) " +
                "RETURN f.id",
                new { userId }
            );

            return result.Select(r => (long)r[0]).ToList();
        }
    }
}
