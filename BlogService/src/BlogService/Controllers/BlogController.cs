using Explorer.Blog.API.Dtos;
using Explorer.Blog.API.Public;
using Explorer.BuildingBlocks.Core.UseCases;
using FluentResults;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Explorer.API.Controllers.Author_Tourist
{
    [ApiController]
    [Route("api/touristOrAuthor/blog")]
    public class BlogController : BaseApiController
    {
        private readonly IBlogService _blogService;

        public BlogController(IBlogService blogService)
        {
            _blogService = blogService;
        }

        [HttpPost]
        public ActionResult<BlogDto> Create([FromBody] BlogDto blog)
        {
            var result = _blogService.Create(blog);
            return CreateResponse(result);
        }

        [HttpPut("{id:int}")]
        public ActionResult<BlogDto> Update([FromBody] BlogDto blog)
        {
            var result = _blogService.Update(blog);
            return CreateResponse(result);
        }

		[HttpGet("{id:int}")]
		public ActionResult<BlogDto> Get([FromQuery] int id)
        {
                return CreateResponse(_blogService.Get(id));       
        }

		[HttpGet]
		public ActionResult<PagedResult<BlogDto>> GetAll([FromQuery] int page, [FromQuery] int pageSize)
		{
            try
            {
                var result = _blogService.GetPaged(page, pageSize);
                return CreateResponse(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpDelete("{id:int}")]
		public ActionResult<BlogDto> Delete([FromQuery] int id)
		{
			return CreateResponse(_blogService.Delete(id));
		}

        [HttpGet("all")]
        public ActionResult<IEnumerable<BlogDto>> GetAllBlogs()
        {
            var blogs = _blogService.GetAllBlogs();
            return CreateResponse(blogs);
        }

        [HttpGet("blogDetails/{id:long}")]
        public ActionResult<BlogDetailsDto> GetBlogDetails([FromRoute] long id)
        {
            var blogResult = _blogService.GetBlogDetails(id);
            return CreateResponse(blogResult);
        }

        [HttpGet("byTag")]
        public ActionResult<List<BlogHomeDto>> GetBlogsByTag([FromQuery] string tag)
        {
            var result = _blogService.GetBlogsByTag(tag);
            return CreateResponse(result);
        }
    }
}
