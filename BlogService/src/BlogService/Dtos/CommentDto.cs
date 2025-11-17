using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.API.Dtos
{
    public class CommentDto
    {
        public long Id { get; set; }

        public string Text { get; set; }

        public DateTime CreationDate { get; set; }

        public DateTime UpdateDate { get; set; }

        public int UserId { get; set; }

        public long BlogId { get; set; }
        
        public string? AuthorUsername {  get; set; }

    }

}

