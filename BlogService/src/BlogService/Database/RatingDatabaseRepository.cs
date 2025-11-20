using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Explorer.Blog.Core.Domain;
using Explorer.Blog.Core.Domain.RepositoryInterfaces;
using Explorer.Blog.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BlogService.Database
{
    public class RatingDatabaseRepository : IRatingRepository
    {
        private readonly BlogContext _dbContext;

        public RatingDatabaseRepository(BlogContext dbContext)
        {

            _dbContext = dbContext;
        }
       
    }
}
