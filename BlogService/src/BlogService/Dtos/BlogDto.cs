using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.API.Dtos
{
    public class BlogDto
    {
        public long Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public int? UserId { get; set; }
        public List<BlogPictureDto> Pictures { get; set; }
        public List<CommentDto> Comments { get; set; }
        public string? Username {  get; set; }
        public List<string> Tags { get; set; }
        public List<BlogRatingDto> Ratings { get; set; }
    }

}
