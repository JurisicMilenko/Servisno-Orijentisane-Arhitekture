using Explorer.Blog.API.Dtos;
using Explorer.BuildingBlocks.Core.UseCases;
using FluentResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.API.Public
{
    public interface IBlogService
    {
        Result<BlogDto> Create(BlogDto blog);
        Result<BlogDto> Update(BlogDto blog);
        Result<PagedResult<BlogDto>> GetPaged(int page, int pageSize);
        Result<BlogDto> Get(int id);
		Result Delete(int id);
        Result<BlogDetailsDto> GetBlogDetails(long id);
        Result<List<BlogHomeDto>> GetBlogsByTag(string tag);
        Result<List<BlogDto>> GetAllBlogs();
        Result<List<BlogHomeDto>> GetHomePaged(int page, int pageSize);
    }
}
