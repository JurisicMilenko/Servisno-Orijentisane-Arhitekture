using Explorer.Stakeholders.API.Public;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
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
        public async Task<IActionResult> Follow(long targetId, [FromQuery] long userId)
        {
            await _service.Follow(userId, targetId);
            return Ok();
        }

        [HttpDelete("{targetId}")]
        public async Task<IActionResult> Unfollow(long targetId, [FromQuery] long userId)
        {
            await _service.Unfollow(userId, targetId);
            return Ok();
        }

        [HttpGet("me/followers")]
        public async Task<IActionResult> GetMyFollowers([FromQuery] long userId)
        {
            var followers = await _service.GetFollowers(userId);
            return Ok(followers);
        }

        [HttpGet("me/following")]
        public async Task<IActionResult> GetMyFollowing([FromQuery] long userId)
        {
            var following = await _service.GetFollowing(userId);
            return Ok(following);
        }

        [HttpGet("suggested")]
        public async Task<IActionResult> Suggested([FromQuery] long userId)
        {
            var suggestions = await _service.GetSuggestedFollowers(userId);
            return Ok(suggestions);
        }
    }
}
