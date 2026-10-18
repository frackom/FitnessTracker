using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace FitnessTracker.Api.Tests;

public class AuthenticationTests
    : IClassFixture<FitnessTrackerApiFactory>, IAsyncLifetime
{
    private readonly FitnessTrackerApiFactory _factory;

    public AuthenticationTests(FitnessTrackerApiFactory factory)
    {
        _factory = factory;
    }

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Register_Login_And_Logout_Work()
    {
        using var client = TestAuth.CreateClient(_factory);
        const string email = "account@example.com";

        await TestAuth.RegisterAsync(client, email);

        // Registration alone should not sign the user in.
        using var beforeLogin = await client.GetAsync("/api/auth/me");

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            beforeLogin.StatusCode);

        await TestAuth.LoginAsync(client, email);

        using var meResponse = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var user =
            await meResponse.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(email, user.GetProperty("email").GetString());
        Assert.False(
            string.IsNullOrWhiteSpace(
                user.GetProperty("id").GetString()));

        using var logout = await TestAuth.SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/logout");

        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        using var afterLogout = await client.GetAsync("/api/auth/me");

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            afterLogout.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        using var client = TestAuth.CreateClient(_factory);
        const string email = "account@example.com";

        await TestAuth.RegisterAsync(client, email);

        using var response = await TestAuth.SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/login",
            new
            {
                email,
                password = "WrongPassword123!",
                rememberMe = false
            });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        using var me = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
    }

    [Fact]
    public async Task DuplicateEmail_IsRejected()
    {
        using var client = TestAuth.CreateClient(_factory);
        const string email = "account@example.com";

        await TestAuth.RegisterAsync(client, email);

        using var response = await TestAuth.SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/register",
            new
            {
                email = "ACCOUNT@example.com",
                password = TestAuth.Password
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/auth/me")]
    [InlineData("/api/routines")]
    [InlineData("/api/workouts")]
    public async Task ProtectedGet_WithoutLogin_ReturnsUnauthorized(
        string path)
    {
        using var client = TestAuth.CreateClient(_factory);

        using var response = await client.GetAsync(path);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithoutCsrfToken_IsRejected()
    {
        using var client = TestAuth.CreateClient(_factory);

        using var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                email = "account@example.com",
                password = TestAuth.Password
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithoutCsrfToken_IsRejected()
    {
        using var client = TestAuth.CreateClient(_factory);

        await TestAuth.RegisterAndLoginAsync(
            client,
            "account@example.com");

        using var response = await client.PostAsJsonAsync(
            "/api/auth/logout",
            new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        // The rejected logout must leave the session intact.
        using var me = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
    }
}