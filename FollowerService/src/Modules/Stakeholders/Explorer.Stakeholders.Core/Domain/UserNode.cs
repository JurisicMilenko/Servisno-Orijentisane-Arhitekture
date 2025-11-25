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
        public string Username { get; init; }
        public string Role { get; init; }

        public UserNode(long userId, string username, string role)
        {
            UserId = userId;
            Username = username;
            Role = role;
        }
    }
}
