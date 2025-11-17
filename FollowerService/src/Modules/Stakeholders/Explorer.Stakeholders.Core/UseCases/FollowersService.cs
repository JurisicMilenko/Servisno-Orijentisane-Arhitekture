using Explorer.Stakeholders.API.Public;
using Explorer.Stakeholders.Core.Domain.RepositoryInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.Core.UseCases
{
    public class FollowersService : IFollowersService
    {
        private readonly IFollowersRepository _repo;

        public FollowersService(IFollowersRepository repo)
        {
            _repo = repo;
        }

        public Task Follow(long followerId, long targetId)
            => _repo.Follow(followerId, targetId);

        public Task Unfollow(long followerId, long targetId)
            => _repo.Unfollow(followerId, targetId);

        public Task<List<long>> GetFollowers(long userId) 
            => _repo.GetFollowers(userId);

        public Task<List<long>> GetFollowing(long userId)
            => _repo.GetFollowing(userId);
    }
}
