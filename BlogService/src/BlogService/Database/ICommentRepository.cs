using Explorer.Blog.Core.Domain.Blogs;
using FluentResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.Core.Domain.RepositoryInterfaces
{
    public interface ICommentRepository
    {
        public IEnumerable<Comment> GetByBlogId(long id);
    }
}
