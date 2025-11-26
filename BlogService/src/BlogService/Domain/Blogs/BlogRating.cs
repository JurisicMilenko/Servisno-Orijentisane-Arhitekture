using Explorer.BuildingBlocks.Core.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Explorer.Blog.Core.Domain.Blogs
{
    public class BlogRating : Entity
    {
        public int UserId { get; set; }
        public int BlogId { get; set; }
        public VoteType VoteType { get; set; }

        [JsonConstructor]
        public BlogRating(int userId, VoteType voteType, int blogId)
        {
            //Validate(userId, voteType);
            UserId = userId;
            BlogId = blogId;
            VoteType = voteType;
        }

        public BlogRating()
        {

        }

        private void Validate(int userId, VoteType voteType)
        {
            if (userId == 0)
            {
                throw new ArgumentException("User ID must not be a zero.");
            }
            if (voteType == null)
            {
                throw new ArgumentException("Vote type cannot be null.");
            }
        }

        /*protected override IEnumerable<object> GetEqualityComponents()
        {
            return new object[] { VoteType, UserId };
        }*/


    }

    public enum VoteType
    {
        Upvote,
        Downvote
    }
}
