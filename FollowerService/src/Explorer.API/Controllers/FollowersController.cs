using Explorer.Stakeholders.API.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Explorer.API.Controllers
{
    [ApiController]
    [Route("api/followers")]
    [Authorize]
    public class FollowersController : ControllerBase
    {
        private readonly IFollowersService _service;

        public FollowersController(IFollowersService service)
        {
            _service = service;
        }

        [HttpPost("{targetId}")]
        public async Task<IActionResult> Follow(long targetId)
        {
            long userId = long.Parse(User.FindFirst("sub")!.Value);
            await _service.Follow(userId, targetId);
            return Ok();
        }

        [HttpDelete("{targetId}")]
        public async Task<IActionResult> Unfollow(long targetId)
        {
            long userId = long.Parse(User.FindFirst("sub")!.Value);
            await _service.Unfollow(userId, targetId);
            return Ok();
        }

        [HttpGet("me/followers")]
        public async Task<IActionResult> GetMyFollowers()
        {
            long userId = long.Parse(User.FindFirst("sub")!.Value);
            var followers = await _service.GetFollowers(userId);
            return Ok(followers);
        }

        [HttpGet("me/following")]
        public async Task<IActionResult> GetMyFollowing()
        {
            long userId = long.Parse(User.FindFirst("sub")!.Value);
            var following = await _service.GetFollowing(userId);
            return Ok(following);
        }

        [HttpGet("suggested")]
        public async Task<IActionResult> Suggested()
        {
            long userId = long.Parse(User.FindFirst("sub")!.Value);
            var suggestions = await _service.GetSuggestedFollowers(userId);
            return Ok(suggestions);
        }
    }
}
