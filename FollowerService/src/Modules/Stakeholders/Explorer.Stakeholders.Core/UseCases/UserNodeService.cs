using FollowersGrpcService.Grpc;
using Neo4j.Driver;
using Explorer.Stakeholders.API.Public;

namespace Explorer.Stakeholders.Core.UseCases
{
    public class UserNodeService : UserService.UserServiceBase, IUserNodeService
    {
        private readonly IDriver _neo4jDriver;

        public UserNodeService(IDriver neo4jDriver)
        {
            _neo4jDriver = neo4jDriver;
        }

        public override async Task<CreateUserResponse> CreateUserNode(CreateUserRequest request, Grpc.Core.ServerCallContext context)
        {
            Console.WriteLine($"[gRPC] CreateUserNode called with id={request.Id}, username={request.Username}, role={request.Role}");

            var session = _neo4jDriver.AsyncSession();
            try
            {
                await session.RunAsync(
                    "MERGE (u:User { Id: $id }) SET u.username = $username, u.role = $role",
                    new { id = request.Id, username = request.Username, role = request.Role }
                );
            }
            finally
            {
                await session.CloseAsync();
            }

            return new CreateUserResponse { Success = true };
        }
    }
}