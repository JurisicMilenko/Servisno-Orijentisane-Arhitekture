using Explorer.BuildingBlocks.Core.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Explorer.Blog.API.Dtos;
using Explorer.Blog.API.Public;

namespace Explorer.API.Controllers.Author_Tourist
{
    [ApiController]
    [Route("api/blogratings")]
    public class BlogRatingController : BaseApiController
    {
        private readonly IBlogRatingService _ratingService;


        public BlogRatingController(IBlogRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpGet]
        public ActionResult<PagedResult<BlogRatingDto>> GetAll([FromQuery] int page, [FromQuery] int pageSize)
        {
            var result = _ratingService.GetPaged(page, pageSize);
            return CreateResponse(result);
        }

        [HttpPost]
        public ActionResult<BlogRatingDto> Create([FromBody] BlogRatingDto ratingDto)
        {
            var createdRating = _ratingService.Create(ratingDto);
            return CreateResponse(createdRating);
        }

        [HttpPut("{id:int}")]
        public ActionResult<BlogRatingDto> Update([FromBody] BlogRatingDto ratingDto)
        {
            var updateResult = _ratingService.Update(ratingDto);
            return CreateResponse(updateResult);
        }

        [HttpDelete("{id:int}")]
        public ActionResult Delete([FromQuery] int id)
        {
            var deleteResult = _ratingService.Delete(id);
            return CreateResponse(deleteResult);
        }
    }
}