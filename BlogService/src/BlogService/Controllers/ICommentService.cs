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
    public interface ICommentService
    {
        Result<CommentDto> Create(CommentDto comment);
        Result<CommentDto> Update(CommentDto comment);
        Result Delete(int id);
        Result<CommentDto> Get(int id);
        Result<PagedResult<CommentDto>> GetPaged(int page, int pageSize);
        Result<IEnumerable<CommentDto>> GetByBlogId(long id);

    }
}
