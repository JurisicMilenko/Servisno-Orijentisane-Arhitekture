using AutoMapper;
using Explorer.Blog.API.Dtos;
using Explorer.Blog.API.Public;
using Explorer.Blog.Core.Domain.RepositoryInterfaces;
using Explorer.BuildingBlocks.Core.UseCases;
using FluentResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BlogDomain = Explorer.Blog.Core.Domain;

namespace Explorer.Blog.Core.UseCases
{
    public class BlogService : CrudService<BlogDto, BlogDomain.Blogs.Blog>, IBlogService
    {
        private readonly IBlogRepository _blogRepository;
        private readonly IMapper _mapper;

        public BlogService(IBlogRepository blogRepository, ICrudRepository<BlogDomain.Blogs.Blog> repository, IMapper mapper) : base(repository, mapper)
        {
            _blogRepository = blogRepository;
            _mapper = mapper;
        }

        public Result<BlogDetailsDto> GetBlogDetails(long id)
        {
            var blog = _blogRepository.Get(id);
            var blogDto = _mapper.Map<BlogDetailsDto>(blog);
            return blogDto;
        }

        public Result<List<BlogDto>> GetAllBlogs()
        {
            var blogs = _blogRepository.GetAllBlogsWithPictures().ToList();
            return _mapper.Map<List<BlogDto>>(blogs);
        }

        public Result<List<BlogHomeDto>> GetHomePaged(int page, int pageSize)
        {
            List<Domain.Blogs.Blog> blogs = _blogRepository.GetAggregatePaged(page, pageSize);
            List<BlogHomeDto> blogDtos = new List<BlogHomeDto>();

            foreach (var blog in blogs)
            {
                blogDtos.Add(new BlogHomeDto()
                {
                    Description = blog.Description,
                    Id = blog.Id,
                    ImageUrl = blog.Pictures.FirstOrDefault()?.Data,
                    Title = blog.Title,
                    CreatedAt = blog.CreatedAt
                });
            }
            return blogDtos;
        }

        public Result<List<BlogHomeDto>> GetBlogsByTag(string tag)
        {
            var blogs = _blogRepository.GetBlogsByTag(tag).ToList();
            List<BlogHomeDto> blogDtos = new List<BlogHomeDto>();
            foreach (var blog in blogs)
            {
                blogDtos.Add(new BlogHomeDto()
                {
                    Description = blog.Description,
                    Id = blog.Id,
                    ImageUrl = blog.Pictures.FirstOrDefault()?.Data,
                    Title = blog.Title,
                    CreatedAt = blog.CreatedAt,
                    Tags = blog.Tags
                });
            }
            return blogDtos;
        }
    }
}
