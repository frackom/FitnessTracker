using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FitnessTracker.Api.Responses;

namespace FitnessTracker.Api.Tests;

public sealed class RoutinesApiTests
    : IClassFixture<FitnessTrackerApiFactory>,
      IAsyncLifetime
{
    private readonly FitnessTrackerApiFactory _factory;
    private readonly HttpClient _client;

    public RoutinesApiTests(FitnessTrackerApiFactory factory)
    {
        _factory = factory;
        _client = TestAuth.CreateClient(factory);
    }

    public async Task InitializeAsync()
    {
        await _factory.ResetDatabaseAsync();

        await TestAuth.RegisterAndLoginAsync(
            _client,
            $"test-{Guid.NewGuid():N}@example.com");
    }

    public Task DisposeAsync()
    {
        _client.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task GetRoutines_ReturnsSavedRoutines()
    {
        int routineId = await CreateRoutineAsync();

        using var response =
            await _client.GetAsync("/api/routines");

        response.EnsureSuccessStatusCode();

        var routines = await response.Content
            .ReadFromJsonAsync<List<RoutineResponse>>();

        Assert.NotNull(routines);

        var routine = Assert.Single(routines);

        Assert.Equal(routineId, routine.Id);
        Assert.Equal("Full Body", routine.Name);
        Assert.Equal(2, routine.Exercises.Count);
    }

    [Fact]
    public async Task GetRoutine_ReturnsNotFound_WhenMissing()
    {
        using var response =
            await _client.GetAsync("/api/routines/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoutine_SavesRoutineAndExercises()
    {
        var request = new
        {
            name = "Full Body",
            description = "Full-body workout",
            exercises = new[]
            {
                new
                {
                    exerciseId = 1,
                    targetSets = 3,
                    targetReps = 8
                },
                new
                {
                    exerciseId = 2,
                    targetSets = 4,
                    targetReps = 6
                }
            }
        };

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Post,
            "/api/routines",
            request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var counts = await _factory.GetDatabaseCountsAsync();

        Assert.Equal(1, counts.Routines);
        Assert.Equal(2, counts.RoutineExercises);
        Assert.Equal(5, counts.Exercises);
    }

    [Fact]
    public async Task CreateRoutine_RejectsDuplicateExercises()
    {
        var request = new
        {
            name = "Duplicate Routine",
            description = "",
            exercises = new[]
            {
                new
                {
                    exerciseId = 1,
                    targetSets = 3,
                    targetReps = 8
                },
                new
                {
                    exerciseId = 1,
                    targetSets = 4,
                    targetReps = 10
                }
            }
        };

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Post,
            "/api/routines",
            request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var counts = await _factory.GetDatabaseCountsAsync();

        Assert.Equal(0, counts.Routines);
        Assert.Equal(0, counts.RoutineExercises);
    }

    [Fact]
    public async Task CreateRoutine_RejectsMissingExercises()
    {
        var request = new
        {
            name = "Invalid Routine",
            description = "",
            exercises = new[]
            {
                new
                {
                    exerciseId = 999,
                    targetSets = 3,
                    targetReps = 8
                }
            }
        };

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Post,
            "/api/routines",
            request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var counts = await _factory.GetDatabaseCountsAsync();

        Assert.Equal(0, counts.Routines);
    }

    [Fact]
    public async Task UpdateRoutine_UpdatesDetailsAndExercises()
    {
        int routineId = await CreateRoutineAsync();

        var updateRequest = new
        {
            name = "Updated Routine",
            description = "Updated description",
            exercises = new[]
            {
                new
                {
                    exerciseId = 3,
                    targetSets = 5,
                    targetReps = 12
                }
            }
        };

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Put,
            $"/api/routines/{routineId}",
            updateRequest);

        response.EnsureSuccessStatusCode();

        var updatedRoutine = await response.Content
            .ReadFromJsonAsync<RoutineResponse>();

        Assert.NotNull(updatedRoutine);
        Assert.Equal("Updated Routine", updatedRoutine.Name);

        Assert.Equal(
            "Updated description",
            updatedRoutine.Description);

        var exercise = Assert.Single(updatedRoutine.Exercises);

        Assert.Equal(3, exercise.ExerciseId);
        Assert.Equal(5, exercise.TargetSets);
        Assert.Equal(12, exercise.TargetReps);

        var counts = await _factory.GetDatabaseCountsAsync();

        Assert.Equal(1, counts.Routines);
        Assert.Equal(1, counts.RoutineExercises);
        Assert.Equal(5, counts.Exercises);
    }

    [Fact]
    public async Task UpdateRoutine_ReturnsNotFound_WhenMissing()
    {
        var request = new
        {
            name = "Missing Routine",
            description = "",
            exercises = new[]
            {
                new
                {
                    exerciseId = 1,
                    targetSets = 3,
                    targetReps = 8
                }
            }
        };

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Put,
            "/api/routines/999",
            request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteRoutine_RemovesRoutineButKeepsExercises()
    {
        int routineId = await CreateRoutineAsync();

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Delete,
            $"/api/routines/{routineId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var counts = await _factory.GetDatabaseCountsAsync();

        Assert.Equal(0, counts.Routines);
        Assert.Equal(0, counts.RoutineExercises);
        Assert.Equal(5, counts.Exercises);
    }

    private async Task<int> CreateRoutineAsync()
    {
        var request = new
        {
            name = "Full Body",
            description = "Full-body workout",
            exercises = new[]
            {
                new
                {
                    exerciseId = 1,
                    targetSets = 3,
                    targetReps = 8
                },
                new
                {
                    exerciseId = 2,
                    targetSets = 4,
                    targetReps = 6
                }
            }
        };

        using var response = await TestAuth.SendAsync(
            _client,
            HttpMethod.Post,
            "/api/routines",
            request);

        response.EnsureSuccessStatusCode();

        using var document = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync());

        return document.RootElement
            .GetProperty("id")
            .GetInt32();
    }
}