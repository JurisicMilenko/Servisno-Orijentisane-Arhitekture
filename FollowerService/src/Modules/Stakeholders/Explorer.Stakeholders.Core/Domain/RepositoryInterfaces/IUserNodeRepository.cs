using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.Core.Domain.RepositoryInterfaces
{
    public interface IFollowersRepository
    {
        void Follow(long followerId, long targetId);
        void Unfollow(long followerId, long targetId);
        List<long> GetFollowers(long userId);
    }
}
