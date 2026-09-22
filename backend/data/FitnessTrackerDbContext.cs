using FitnessTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Data;

public class FitnessTrackerDbContext : DbContext
{
    public FitnessTrackerDbContext(DbContextOptions<FitnessTrackerDbContext> options) : base(options)
    {
    }

    public DbSet<Exercise> Exercises => Set<Exercise>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Exercise>().HasData(
            new Exercise
            {
                Id = 1,
                Name = "Bench Press",
                MuscleGroup = "Chest",
                Description = "Barbell pressing exercise",
                ImageUrl = "/assets/ExerciseImages/chestpress.jpg"
            },
            new Exercise
            {
                Id = 2,
                Name = "Squat",
                MuscleGroup = "Legs",
                Description = "Compound lower-body exercise",
                ImageUrl = "/assets/ExerciseImages/squat.jpg"
            }
        );
    }
}