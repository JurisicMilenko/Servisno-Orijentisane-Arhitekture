using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.API.Dtos
{
    public class BlogPictureDto
    {
        public int Id {  get; set; }
        public string Data { get; set; }

        public int BlogId { get; set; }


        public BlogPictureDto() { }
        public BlogPictureDto(int blogId, string data)
        {
            BlogId = blogId;
            Data = data;
        }

    }
}