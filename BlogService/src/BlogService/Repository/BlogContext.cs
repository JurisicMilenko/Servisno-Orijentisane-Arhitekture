using Explorer.Blog.Core.Domain.Blogs;
using Microsoft.EntityFrameworkCore;
using BlogDomain = Explorer.Blog.Core.Domain;

namespace Explorer.Blog.Infrastructure.Database;
public class BlogContext : DbContext
{
    public DbSet<BlogDomain.Blogs.Blog> Blogs { get; set; }
    public DbSet<BlogPicture> BlogPictures { get; set; }
    public DbSet<Comment> Comment { get; set; }
    public BlogContext(DbContextOptions<BlogContext> options) : base(options) {}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BlogDomain.Blogs.Blog>()
            .Property(item => item.Ratings)
            .HasColumnType("jsonb");

        modelBuilder.Entity<BlogDomain.Blogs.Blog>()
            .HasMany(b => b.Pictures) 
            .WithOne(p => p.Blog)      
            .HasForeignKey(p => p.BlogId)  
            .OnDelete(DeleteBehavior.Cascade);  

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Blog)         
            .WithMany(b => b.Comments)    
            .HasForeignKey(c => c.BlogId) 
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BlogRating>(entity =>
        {
           
        });

        modelBuilder.HasDefaultSchema("blog");
    }    
}