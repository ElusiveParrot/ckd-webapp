using CKDCalculator.Models;
using Microsoft.EntityFrameworkCore;

namespace CKDCalculator.Data;

public class PatientDatabaseContext : DbContext
{
    public PatientDatabaseContext(DbContextOptions<PatientDatabaseContext> options) : base(options)
    {
        
    }

    public DbSet<User> Users { set; get; }
    public DbSet<Measurement> Measurements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.NhsNumber).IsUnique();
            entity.HasIndex(e => e.ProfessionalId).IsUnique();
        });
    }
}
