using AutoMapper;
using Explorer.BuildingBlocks.Core.UseCases;
using Explorer.Blog.API.Dtos;
using Explorer.Blog.API.Public;
using Explorer.Blog.Core.Domain;
using FluentResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Explorer.Blog.Core.Domain.Blogs;
using Explorer.Blog.Core.Domain.RepositoryInterfaces;

namespace Explorer.Blog.Core.UseCases
{
    public class BlogRatingService : CrudService<BlogRatingDto, BlogRating>, IBlogRatingService
    {
        private IBlogService _personService;
        private IMapper _mapper;
        private IRatingRepository _ratingRepository;

        public BlogRatingService(ICrudRepository<BlogRating> repository, IBlogService blogService, IMapper mapper,IRatingRepository ratingRepository) : base(
            repository, mapper)
        {
            this._mapper = mapper;
            this._personService = blogService;
            this._ratingRepository = ratingRepository;
        }

        
    }
}
