using BlogService.Database;
using Explorer.Blog.API.Dtos;
using Explorer.Blog.Core.Domain.Blogs;
using Google.Protobuf;
using Grpc.Core;
using Microsoft.AspNetCore.Http.HttpResults;
using rating.grpc;

public class BlogRatingGrpcService : BlogRatingGrpc.BlogRatingGrpcBase
{
    private readonly RatingDatabaseRepository _repository;

    public BlogRatingGrpcService(RatingDatabaseRepository repository)
    {
        _repository = repository;
    }

    public override async Task<BlogRatingPagedResponse> GetBlogRatingsPaged(BlogRatingPagedRequest request, ServerCallContext context)
    {
        var ratings = await _repository.GetBlogRatingsPaged(request.PageNumber, request.PageSize);

        var response = new BlogRatingPagedResponse
        {
            TotalCount = ratings.Count
        };

        response.Ratings.AddRange(ratings.Select(r => new rating.grpc.BRDto
        {
            Id = (int)r.Id,
            BlogId = r.BlogId,
            UserId = r.UserId,
            VoteType = r.VoteType.ToString() // gRPC DTO uses string
        }));

        return response;
    }

    public override async Task<CreateBlogRatingResponse> CreateBlogRating(CreateBlogRatingRequest request, ServerCallContext context)
    {
        try
        {
            var existing = await _repository.GetByUserAndBlog(request.UserId, request.BlogId);
            if (existing != null)
                throw new RpcException(new Grpc.Core.Status(StatusCode.AlreadyExists, "User already voted for this blog"));

            var rating = new BlogRating(request.UserId, Enum.Parse<Explorer.Blog.Core.Domain.Blogs.VoteType>(request.VoteType), request.BlogId);
            var created = await _repository.CreateBlogRating(rating);
            return new CreateBlogRatingResponse { Id = (int)created.Id };
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
            return new CreateBlogRatingResponse { };
        }
    }

    public override async Task<UpdateBlogRatingResponse> UpdateBlogRating(UpdateBlogRatingRequest request, ServerCallContext context)
    {
        var rating = new BlogRating(request.UserId, Enum.Parse<Explorer.Blog.Core.Domain.Blogs.VoteType>(request.VoteType), request.BlogId)
        {
            Id = request.Id
        };

        await _repository.UpdateBlogRating(rating);
        return new UpdateBlogRatingResponse { Success = true };
    }

    public override async Task<DeleteBlogRatingResponse> DeleteBlogRating(DeleteBlogRatingRequest request, ServerCallContext context)
    {
        var success = await _repository.DeleteBlogRating(request.Id);
        return new DeleteBlogRatingResponse { Success = success };
    }
}
