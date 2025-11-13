using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Explorer.BuildingBlocks.Core.UseCases;
using Explorer.Blog.API.Dtos;
using Explorer.BuildingBlocks.Core.UseCases;
using FluentResults;

namespace Explorer.Blog.API.Public
{
    public interface IBlogRatingService
    {
        Result<PagedResult<BlogRatingDto>> GetPaged(int page, int pageSize);
        Result<BlogRatingDto> Create(BlogRatingDto rating);
        Result<BlogRatingDto> Update(BlogRatingDto rating);
        Result Delete(int id);
    }
}
