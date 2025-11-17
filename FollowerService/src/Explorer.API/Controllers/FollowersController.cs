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
        public async Task<IActionResult> Follow(long targetId, [FromQuery] long followerId)
        {
            await _service.Follow(followerId, targetId);
            return Ok();
        }

        [HttpDelete("{targetId}")]
        public async Task<IActionResult> Unfollow(long targetId, [FromQuery] long followerId)
        {
            await _service.Unfollow(followerId, targetId);
            return Ok();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFollowers(long userId)
        {
            var followers = await _service.GetFollowers(userId);
            return Ok(followers);
        }

        [HttpGet("{userId}/following")]
        public async Task<IActionResult> GetFollowing(long userId)
        {
            var following = await _service.GetFollowing(userId);
            return Ok(following);
        }
    }
}
