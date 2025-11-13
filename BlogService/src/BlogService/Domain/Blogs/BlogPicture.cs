using Explorer.BuildingBlocks.Core.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.Core.Domain.Blogs
{
    public class BlogPicture : Entity
    {
        public string Data { get; private set; }
        public long BlogId { get; private set; }
        public Blog Blog { get; private set; }

        public BlogPicture() { }
        public BlogPicture(long blogId, string data, Blog blog = null)
        {
            BlogId = blogId;
            Blog = blog;
            Data = data;
        }
    }
}
