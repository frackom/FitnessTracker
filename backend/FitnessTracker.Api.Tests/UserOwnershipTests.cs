using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace FitnessTracker.Api.Tests;

public class UserOwnershipTests
    : IClassFixture<FitnessTrackerApiFactory>, IAsyncLifetime
{
    private readonly FitnessTrackerApiFactory _factory;

    public UserOwnershipTests(FitnessTrackerApiFactory factory)
    {
        _factory = factory;
    }

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    private static object RoutineBody(string name) => new
    {
        name,
        description = "Ownership test",
        exercises = new[]
        {
            new
            {
                exerciseId = 1,
                targetSets = 3,
                targetReps = 10
            }
        }
    };

    private static object WorkoutBody(int routineId) => new
    {
        routineId,
        sets = new[]
        {
            new
            {
                exerciseId = 1,
                setNumber = 1,
                reps = 10,
                weightKg = 40m
            }
        }
    };

    private static async Task<int> CreateRoutineAsync(
        HttpClient client,
        string name)
    {
        using var response = await TestAuth.SendAsync(
            client,
            HttpMethod.Post,
            "/api/routines",
            RoutineBody(name));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var data =
            await response.Content.ReadFromJsonAsync<JsonElement>();

        return data.GetProperty("id").GetInt32();
    }

    private static async Task<JsonElement> GetJsonAsync(
        HttpClient client,
        string path)
    {
        using var response = await client.GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    [Fact]
    public async Task Users_SeeOnlyTheirOwnRoutinesAndWorkouts()
    {
        using var alice = TestAuth.CreateClient(_factory);
        using var bob = TestAuth.CreateClient(_factory);

        await TestAuth.RegisterAndLoginAsync(alice, "alice@example.com");
        await TestAuth.RegisterAndLoginAsync(bob, "bob@example.com");

        int aliceRoutineId =
            await CreateRoutineAsync(alice, "Alice routine");

        int bobRoutineId =
            await CreateRoutineAsync(bob, "Bob routine");

        using var aliceWorkout = await TestAuth.SendAsync(
            alice,
            HttpMethod.Post,
            "/api/workouts",
            WorkoutBody(aliceRoutineId));

        using var bobWorkout = await TestAuth.SendAsync(
            bob,
            HttpMethod.Post,
            "/api/workouts",
            WorkoutBody(bobRoutineId));

        Assert.Equal(
            HttpStatusCode.Created,
            aliceWorkout.StatusCode);

        Assert.Equal(
            HttpStatusCode.Created,
            bobWorkout.StatusCode);

        var aliceRoutines = await GetJsonAsync(alice, "/api/routines");
        var bobRoutines = await GetJsonAsync(bob, "/api/routines");

        Assert.Equal(1, aliceRoutines.GetArrayLength());
        Assert.Equal(1, bobRoutines.GetArrayLength());

        Assert.Equal(
            aliceRoutineId,
            aliceRoutines[0].GetProperty("id").GetInt32());

        Assert.Equal(
            bobRoutineId,
            bobRoutines[0].GetProperty("id").GetInt32());

        var aliceHistory = await GetJsonAsync(alice, "/api/workouts");
        var bobHistory = await GetJsonAsync(bob, "/api/workouts");

        Assert.Equal(1, aliceHistory.GetArrayLength());
        Assert.Equal(1, bobHistory.GetArrayLength());

        Assert.Equal(
            "Alice routine",
            aliceHistory[0].GetProperty("routineName").GetString());

        Assert.Equal(
            "Bob routine",
            bobHistory[0].GetProperty("routineName").GetString());
    }

    [Fact]
    public async Task AnotherUser_CannotReadUpdateDeleteOrUseRoutine()
    {
        using var owner = TestAuth.CreateClient(_factory);
        using var other = TestAuth.CreateClient(_factory);

        await TestAuth.RegisterAndLoginAsync(owner, "owner@example.com");
        await TestAuth.RegisterAndLoginAsync(other, "other@example.com");

        int routineId = await CreateRoutineAsync(owner, "Owner routine");

        using var read =
            await other.GetAsync($"/api/routines/{routineId}");

        using var update = await TestAuth.SendAsync(
            other,
            HttpMethod.Put,
            $"/api/routines/{routineId}",
            RoutineBody("Changed by another user"));

        using var delete = await TestAuth.SendAsync(
            other,
            HttpMethod.Delete,
            $"/api/routines/{routineId}");

        using var workout = await TestAuth.SendAsync(
            other,
            HttpMethod.Post,
            "/api/workouts",
            WorkoutBody(routineId));

        Assert.Equal(HttpStatusCode.NotFound, read.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, update.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, workout.StatusCode);

        // Confirm the denied requests did not change the owner's data.
        var unchanged =
            await GetJsonAsync(owner, $"/api/routines/{routineId}");

        Assert.Equal(
            "Owner routine",
            unchanged.GetProperty("name").GetString());

        var ownerHistory = await GetJsonAsync(owner, "/api/workouts");
        var otherHistory = await GetJsonAsync(other, "/api/workouts");

        Assert.Equal(0, ownerHistory.GetArrayLength());
        Assert.Equal(0, otherHistory.GetArrayLength());
    }

    [Theory]
    [InlineData("missing")]
    [InlineData("invalid")]
    public async Task CreateRoutine_WithoutValidCsrf_IsRejected(
        string tokenMode)
    {
        using var client = TestAuth.CreateClient(_factory);

        await TestAuth.RegisterAndLoginAsync(
            client,
            "account@example.com");

        using var request =
            new HttpRequestMessage(HttpMethod.Post, "/api/routines");

        request.Content = JsonContent.Create(RoutineBody("Rejected"));

        if (tokenMode == "invalid")
        {
            request.Headers.Add("X-CSRF-TOKEN", "invalid-token");
        }

        using var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var routines = await GetJsonAsync(client, "/api/routines");

        Assert.Equal(0, routines.GetArrayLength());
    }
}