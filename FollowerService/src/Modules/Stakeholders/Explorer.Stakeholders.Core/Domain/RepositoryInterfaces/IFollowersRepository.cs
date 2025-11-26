using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Explorer.Stakeholders.API.Dtos;

namespace Explorer.Stakeholders.Core.Domain.RepositoryInterfaces
{
    public interface IFollowersRepository
    {
        Task Follow(long followerId, long targetId);
        Task Unfollow(long followerId, long targetId);
        Task<List<long>> GetFollowers(long userId);
        Task<List<long>> GetFollowing(long userId);
        Task<List<UserNodeDTO>> GetSuggestedFollowers(long userId);
    }
}
