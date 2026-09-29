using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace FitnessTracker.Api.Tests;

public sealed class WorkoutsApiTests : IClassFixture<FitnessTrackerApiFactory>, IAsyncLifetime
{
    private readonly FitnessTrackerApiFactory _factory;
    private readonly HttpClient _client;

    public WorkoutsApiTests(FitnessTrackerApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    private async Task<int> CreateRoutineAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/routines", new
        {
            name = "Strength",
            description = "",
            exercises = new[] { new { exerciseId = 1, targetSets = 2, targetReps = 8 } }
        });
        response.EnsureSuccessStatusCode();
        using var body = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        return body.RootElement.GetProperty("id").GetInt32();
    }

    [Fact]
    public async Task CompleteWorkout_SavesCompletedSetsInHistory()
    {
        var routineId = await CreateRoutineAsync();
        var response = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId,
            sets = new[] { new { exerciseId = 1, setNumber = 1, reps = 7, weightKg = 42.5m } }
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var history = await _client.GetFromJsonAsync<JsonElement>("/api/workouts");
        var workout = Assert.Single(history.EnumerateArray());
        Assert.Equal("Strength", workout.GetProperty("routineName").GetString());
        var set = Assert.Single(workout.GetProperty("sets").EnumerateArray());
        Assert.Equal("Bench Press", set.GetProperty("exerciseName").GetString());
        Assert.Equal(7, set.GetProperty("reps").GetInt32());
        Assert.Equal(42.5m, set.GetProperty("weightKg").GetDecimal());
    }

    [Fact]
    public async Task CompleteWorkout_RejectsSetsOutsideRoutine()
    {
        var routineId = await CreateRoutineAsync();
        var response = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId,
            sets = new[] { new { exerciseId = 2, setNumber = 1, reps = 8, weightKg = 0m } }
        });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var history = await _client.GetFromJsonAsync<JsonElement>("/api/workouts");
        Assert.Empty(history.EnumerateArray());
    }
    [Fact]
    public async Task CompleteWorkout_RejectsDuplicateSetNumbers()
    {
        var routineId = await CreateRoutineAsync();
        var response = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId,
            sets = new[]
            {
                new { exerciseId = 1, setNumber = 1, reps = 8, weightKg = 40m },
                new { exerciseId = 1, setNumber = 1, reps = 6, weightKg = 45m }
            }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var history = await _client.GetFromJsonAsync<JsonElement>("/api/workouts");
        Assert.Empty(history.EnumerateArray());
    }

    [Fact]
    public async Task CompleteWorkout_RejectsInvalidRepsAndEmptySets()
    {
        var routineId = await CreateRoutineAsync();
        var invalidReps = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId,
            sets = new[] { new { exerciseId = 1, setNumber = 1, reps = 0, weightKg = 30m } }
        });
        var emptySets = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId,
            sets = Array.Empty<object>()
        });

        Assert.Equal(HttpStatusCode.BadRequest, invalidReps.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, emptySets.StatusCode);
        var history = await _client.GetFromJsonAsync<JsonElement>("/api/workouts");
        Assert.Empty(history.EnumerateArray());
    }

    [Fact]
    public async Task History_PreservesWorkoutAfterRoutineIsDeleted()
    {
        var routineId = await CreateRoutineAsync();
        var saveResponse = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId,
            sets = new[] { new { exerciseId = 1, setNumber = 1, reps = 8, weightKg = 0m } }
        });
        saveResponse.EnsureSuccessStatusCode();

        var deleteResponse = await _client.DeleteAsync($"/api/routines/{routineId}");
        deleteResponse.EnsureSuccessStatusCode();

        var history = await _client.GetFromJsonAsync<JsonElement>("/api/workouts");
        var workout = Assert.Single(history.EnumerateArray());
        Assert.Equal("Strength", workout.GetProperty("routineName").GetString());
        var set = Assert.Single(workout.GetProperty("sets").EnumerateArray());
        Assert.Equal("Bench Press", set.GetProperty("exerciseName").GetString());
    }

    [Fact]
    public async Task CompleteWorkout_ReturnsNotFoundForMissingRoutine()
    {
        var response = await _client.PostAsJsonAsync("/api/workouts", new
        {
            routineId = 9999,
            sets = new[] { new { exerciseId = 1, setNumber = 1, reps = 8, weightKg = 20m } }
        });
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
