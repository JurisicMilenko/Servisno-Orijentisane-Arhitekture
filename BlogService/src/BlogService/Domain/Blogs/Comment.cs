using Explorer.BuildingBlocks.Core.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Explorer.Blog.Core.Domain.Blogs
{
    public class Comment : Entity
    {

        public string Text { get; private set; }

        public DateTime CreationDate { get; private set; }

        public DateTime UpdateDate { get; private set; }

        public int UserId { get; private set; }
        public long BlogId { get; private set; }
        public Blog Blog { get; private set; }

        public Comment(string text, DateTime creationDate, DateTime updateDate, int userId, long blogId)
        {
            if (string.IsNullOrWhiteSpace(text)) throw new ArgumentNullException("Must contain text");
            Text = text;
            CreationDate = creationDate;
            UpdateDate = updateDate;
            UserId = userId;
            BlogId = blogId;
        }
    }
}
