using System.Threading.Tasks;
using FollowersGrpcService.Grpc;

namespace Explorer.Stakeholders.Core.UseCases
{
    public interface IUserNodeService
    {
        Task<CreateUserResponse> CreateUserNode(CreateUserRequest request, Grpc.Core.ServerCallContext context);
    }
}