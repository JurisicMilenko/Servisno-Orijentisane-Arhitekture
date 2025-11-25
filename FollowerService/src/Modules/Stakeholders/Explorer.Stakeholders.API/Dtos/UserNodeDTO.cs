using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.API.Dtos
{
    public class UserNodeDTO
    {
        public long UserId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public UserNodeDTO(long userId, string username, string role)
        {
            UserId = userId;
            Username = username;
            Role = role;
        }
    }
}
