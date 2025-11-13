using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.API.Dtos
{
    public class BlogRatingDto
    {
        public int Id { get; set; }
        public int UserId {  get; set; }
        public int BlogId { get; set; }
        public VoteType VoteType {  get; set; }

        public BlogRatingDto() { }
        public BlogRatingDto(int userId, VoteType voteType, int blogId) {
            UserId = userId;
            BlogId = blogId;
            this.VoteType = voteType;
        }
        
    }
    public enum VoteType
        {
            Upvote,
            Downvote
        }
}
