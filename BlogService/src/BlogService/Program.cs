using AutoMapper;
using BlogService.Database;
using Explorer.Blog.API.Public;
using Explorer.Blog.Core.Domain.Blogs;
using Explorer.Blog.Core.Domain.RepositoryInterfaces;
using Explorer.Blog.Core.Mappers;
using Explorer.Blog.Core.UseCases;
using Explorer.Blog.Infrastructure.Database;
using Explorer.Blog.Infrastructure.Database.Repositories;
using Explorer.BuildingBlocks.Core.UseCases;
using Explorer.BuildingBlocks.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:80");
// Database environment variables
var host = Environment.GetEnvironmentVariable("DATABASE_HOST") ?? "localhost";
var port = Environment.GetEnvironmentVariable("DATABASE_PORT") ?? "5432";
var database = Environment.GetEnvironmentVariable("DATABASE_SCHEMA") ?? "explorer-v6";
var username = Environment.GetEnvironmentVariable("DATABASE_USERNAME") ?? "postgres";
var password = Environment.GetEnvironmentVariable("DATABASE_PASSWORD") ?? "Jurac2002";

var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";

// Add DbContext
builder.Services.AddDbContext<BlogContext>(options =>
    options.UseNpgsql(connectionString));

// AutoMapper
builder.Services.AddAutoMapper(cfg => { }, typeof(BlogProfile).Assembly);

// Repositories & Services
builder.Services.AddScoped(typeof(ICrudRepository<Explorer.Blog.Core.Domain.Blogs.Blog>), typeof(Explorer.BuildingBlocks.Infrastructure.Database.CrudDatabaseRepository<Explorer.Blog.Core.Domain.Blogs.Blog, BlogContext>));
builder.Services.AddScoped<IBlogRepository, BlogDatabaseRepository>();
builder.Services.AddScoped<IBlogService, Explorer.Blog.Core.UseCases.BlogService>();
builder.Services.AddScoped<RatingDatabaseRepository>();
builder.Services.AddScoped(typeof(ICrudRepository<Explorer.Blog.Core.Domain.Blogs.Blog>), typeof(CrudDatabaseRepository<Explorer.Blog.Core.Domain.Blogs.Blog, BlogContext>));
builder.Services.AddScoped(typeof(ICrudRepository<Comment>), typeof(CrudDatabaseRepository<Comment, BlogContext>));
builder.Services.AddScoped(typeof(ICrudRepository<BlogRating>), typeof(CrudDatabaseRepository<BlogRating, BlogContext>));
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<ICommentRepository, CommentDatabaseRepository>();
builder.Services.AddScoped(typeof(ICrudRepository<Comment>), typeof(CrudDatabaseRepository<Comment, BlogContext>));


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});
builder.Services.AddGrpc(options =>
{
    options.EnableDetailedErrors = true;
});
var app = builder.Build();
app.MapGrpcService<BlogRatingGrpcService>();
app.UseCors("AllowAll");
// Enable Swagger always
app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();
// app.UseHttpsRedirection(); // Disabled for Docker testing




app.UseAuthorization();

app.MapControllers();


app.Run();
