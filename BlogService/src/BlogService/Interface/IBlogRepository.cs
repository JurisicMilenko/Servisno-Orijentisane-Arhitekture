using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BlogDomain = Explorer.Blog.Core.Domain;


namespace Explorer.Blog.Core.Domain.RepositoryInterfaces
{
    public interface IBlogRepository
    {
        public BlogDomain.Blogs.Blog Create(BlogDomain.Blogs.Blog blog);
        public BlogDomain.Blogs.Blog Update(BlogDomain.Blogs.Blog blog);
        public void Delete(long id);
        public BlogDomain.Blogs.Blog Get(long id);
        IEnumerable<BlogDomain.Blogs.Blog> GetAllBlogsWithPictures();
        IEnumerable<BlogDomain.Blogs.Blog> GetBlogsByTag(string tag);
        public List<Blogs.Blog> GetAggregatePaged(int page, int pageSize);
    }
}
