using FitnessTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Data;

public class FitnessTrackerDbContext : DbContext
{
    public FitnessTrackerDbContext(DbContextOptions<FitnessTrackerDbContext> options) : base(options)
    {
    }

    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Routine> Routines => Set<Routine>();
    public DbSet<RoutineExercise> RoutineExercises =>
        Set<RoutineExercise>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutSet> WorkoutSets => Set<WorkoutSet>();

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
            },
            new Exercise
            {
                Id = 3,
                Name = "Lat Pulldown",
                MuscleGroup = "Back",
                Description =
                    "Cable pulling exercise",
                ImageUrl = "/assets/ExerciseImages/latpulldown.jpg"
            },
            new Exercise
            {
                Id = 4,
                Name = "Chest Fly",
                MuscleGroup = "Chest",
                Description =
                    "Machine chest exercise",
                ImageUrl = "/assets/ExerciseImages/chestfly.jpg"
            },
            new Exercise
            {
                Id = 5,
                Name = "Leg Press",
                MuscleGroup = "Legs",
                Description =
                    "Machine lower-body exercise",
                ImageUrl = "/assets/ExerciseImages/legpress.jpg"
            }

        );

        modelBuilder.Entity<RoutineExercise>()
            .HasKey(routineExercise => new
            {
                routineExercise.RoutineId,
                routineExercise.ExerciseId
            });

        modelBuilder.Entity<RoutineExercise>()
            .HasOne(routineExercise => routineExercise.Routine)
            .WithMany(routine => routine.RoutineExercises)
            .HasForeignKey(routineExercise => routineExercise.RoutineId);

        modelBuilder.Entity<RoutineExercise>()
            .HasOne(routineExercise => routineExercise.Exercise)
            .WithMany()
            .HasForeignKey(routineExercise => routineExercise.ExerciseId);

        modelBuilder.Entity<WorkoutSet>()
            .HasOne(set => set.Workout)
            .WithMany(workout => workout.Sets)
            .HasForeignKey(set => set.WorkoutId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkoutSet>()
            .Property(set => set.WeightKg)
            .HasPrecision(8, 2);
    }
}