using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.API.Dtos
{
    public class UserNodeDTO
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; }

        public UserNodeDTO(long id, string username, string role)
        {
            Id = id;
            Username = username;
            Role = role;
        }
    }
}
