using Explorer.Blog.Core.Domain.Blogs;
using Explorer.Blog.Core.Domain.RepositoryInterfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.Infrastructure.Database.Repositories
{
    public class CommentDatabaseRepository: ICommentRepository
    {
        private readonly BlogContext _dbContext;

        public CommentDatabaseRepository(BlogContext dbContext)
        {
            _dbContext = dbContext;
        }

        public IEnumerable<Comment> GetByBlogId(long id)
        {
            return _dbContext.Comment
                .Where(c => c.BlogId == id)
                .OrderBy(c => c.CreationDate);
        }

    }
}
