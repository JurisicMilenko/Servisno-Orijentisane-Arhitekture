using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Stakeholders.Infrastructure.Database
{
    public class FollowersContext : IDisposable
    {
        public IDriver Driver { get; }

        public FollowersContext(string connectionString, string user, string password)
        {
            Driver = GraphDatabase.Driver(connectionString, AuthTokens.Basic(user, password));
        }

        public void Dispose() => Driver?.Dispose();
    }
}
