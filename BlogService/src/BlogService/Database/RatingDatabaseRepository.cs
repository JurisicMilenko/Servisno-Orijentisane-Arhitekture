using Explorer.Blog.Core.Domain.Blogs;
using Explorer.Blog.Core.Domain.RepositoryInterfaces;
using Explorer.Blog.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BlogService.Database
{
    public class RatingDatabaseRepository
    {
        private readonly BlogContext _dbContext;

        public RatingDatabaseRepository(BlogContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<BlogRating>> GetBlogRatingsPaged(int page, int pageSize)
        {
            return await _dbContext.Set<BlogRating>()
                .OrderBy(r => r.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }


        public async Task<BlogRating?> GetByUserAndBlog(int userId, int blogId)
        {
            return await _dbContext.Set<BlogRating>()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BlogId == blogId);
        }

        public async Task<BlogRating> CreateBlogRating(BlogRating rating)
        {
            _dbContext.Set<BlogRating>().Add(rating);
            await _dbContext.SaveChangesAsync();
            return rating;
        }

        public async Task<BlogRating> UpdateBlogRating(BlogRating rating)
        {
            var existing = await _dbContext.Set<BlogRating>().FindAsync(rating.Id);
            if (existing == null) throw new KeyNotFoundException("Rating not found");

            existing.VoteType = rating.VoteType;
            await _dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteBlogRating(int ratingId)
        {
            var rating = await _dbContext.Set<BlogRating>().FindAsync((long)ratingId);
            if (rating == null) return false;

            _dbContext.Set<BlogRating>().Remove(rating);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
