using Explorer.Stakeholders.API.Public;
using Microsoft.AspNetCore.Mvc;

namespace Explorer.API.Controllers
{
    [ApiController]
    [Route("api/followers")]
    public class FollowersController : ControllerBase
    {
        private readonly IFollowersService _service;

        public FollowersController(IFollowersService service)
        {
            _service = service;
        }

        [HttpPost("{targetId}")]
        public IActionResult Follow(long targetId, [FromQuery] long followerId)
        {
            _service.Follow(followerId, targetId);
            return Ok();
        }

        [HttpDelete("{targetId}")]
        public IActionResult Unfollow(long targetId, [FromQuery] long followerId)
        {
            _service.Unfollow(followerId, targetId);
            return Ok();
        }

        [HttpGet("{userId}")]
        public IActionResult GetFollowers(long userId)
        {
            return Ok(_service.GetFollowers(userId));
        }
    }
}
