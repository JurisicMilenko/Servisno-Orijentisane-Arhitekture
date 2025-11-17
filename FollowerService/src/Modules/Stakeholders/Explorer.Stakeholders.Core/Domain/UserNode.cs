using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.Core.Domain
{
    public class UserNode
    {
        public long UserId { get; init; }

        public UserNode(long userId)
        {
            UserId = userId;
        }
    }
}
