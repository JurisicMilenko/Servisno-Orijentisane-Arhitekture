using Explorer.Blog.API.Dtos;
using Explorer.Blog.API.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Explorer.BuildingBlocks.Core.UseCases;
using Explorer.Blog.Core.Domain;

namespace Explorer.API.Controllers.Author_Tourist
{
    [Route("api/touristOrAuthor/comment")]
    public class CommentController : BaseApiController
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost]
        public ActionResult<CommentDto> Create([FromBody] CommentDto comment)
        {
            var result = _commentService.Create(comment);

            return CreateResponse(result);
        }

        [HttpPut("{id:int}")]
        public ActionResult<CommentDto> Update([FromBody] CommentDto comment)
        {
            var result = _commentService.Update(comment);
            return CreateResponse(result);
        }

        [HttpGet("{id:int}")]
        public ActionResult<CommentDto> Get([FromQuery] int id)
        {
            return CreateResponse(_commentService.Get(id));
        }

        [HttpGet]
        public ActionResult<PagedResult<CommentDto>> GetAll([FromQuery] int page, [FromQuery] int pageSize)
        {
            var result = _commentService.GetPaged(page, pageSize);
            return CreateResponse(result);
        }

        [HttpDelete("{id:int}")]
        public ActionResult<CommentDto> Delete([FromQuery] int id)
        {
            return CreateResponse(_commentService.Delete(id));
        }
    }
}
