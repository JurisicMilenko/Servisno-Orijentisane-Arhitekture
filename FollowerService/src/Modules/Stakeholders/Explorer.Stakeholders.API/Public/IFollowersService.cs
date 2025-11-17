using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.API.Public
{
    public interface IFollowersService
    {
        Task Follow(long followerId, long targetId);
        Task Unfollow(long followerId, long targetId);
        Task<List<long>> GetFollowers(long userId);
        Task<List<long>> GetFollowing(long userId);
    }
}
