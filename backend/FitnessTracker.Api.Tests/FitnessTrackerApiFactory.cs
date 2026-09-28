using FitnessTracker.Api.Data;
using FitnessTracker.Api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace FitnessTracker.Api.Tests;

public sealed class FitnessTrackerApiFactory
    : WebApplicationFactory<Program>
{
    private readonly string _databaseName =
        $"FitnessTrackerTests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<
                DbContextOptions<FitnessTrackerDbContext>>();

            services.RemoveAll<
                IDbContextOptionsConfiguration<
                    FitnessTrackerDbContext>>();

            services.RemoveAll<FitnessTrackerDbContext>();

            services.AddDbContext<FitnessTrackerDbContext>(
                options =>
                {
                    options.UseInMemoryDatabase(_databaseName);
                });
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using IServiceScope scope =
            Services.CreateScope();

        FitnessTrackerDbContext context =
            scope.ServiceProvider.GetRequiredService<
                FitnessTrackerDbContext>();

        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();

        if (!await context.Exercises.AnyAsync())
        {
            context.Exercises.AddRange(
                new Exercise
                {
                    Id = 1,
                    Name = "Bench Press",
                    MuscleGroup = "Chest",
                    Description = "Barbell pressing exercise",
                    ImageUrl =
                        "/assets/ExerciseImages/benchpress.jpg"
                },
                new Exercise
                {
                    Id = 2,
                    Name = "Squat",
                    MuscleGroup = "Legs",
                    Description = "Compound lower-body exercise",
                    ImageUrl =
                        "/assets/ExerciseImages/squat.jpg"
                },
                new Exercise
                {
                    Id = 3,
                    Name = "Lat Pulldown",
                    MuscleGroup = "Back",
                    Description = "Cable back exercise",
                    ImageUrl =
                        "/assets/ExerciseImages/latpulldown.jpg"
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
                    Description = "Machine lower-body exercise",
                    ImageUrl = "/assets/ExerciseImages/legpress.jpg"
                }
                );

            await context.SaveChangesAsync();
        }
    }

    public async Task<DatabaseCounts> GetDatabaseCountsAsync()
    {
        using IServiceScope scope =
            Services.CreateScope();

        FitnessTrackerDbContext context =
            scope.ServiceProvider.GetRequiredService<
                FitnessTrackerDbContext>();

        return new DatabaseCounts(
            await context.Routines.CountAsync(),
            await context.RoutineExercises.CountAsync(),
            await context.Exercises.CountAsync()
        );
    }
}

public record DatabaseCounts(
    int Routines,
    int RoutineExercises,
    int Exercises
);