using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FitnessTracker.Api.Tests;

internal static class TestAuth
{
    internal const string Password = "TestAccount123!";

    internal static HttpClient CreateClient(
        FitnessTrackerApiFactory factory)
    {
        return factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost"),
                HandleCookies = true,
                AllowAutoRedirect = false
            });
    }

    internal static async Task<HttpResponseMessage> SendAsync(
        HttpClient client,
        HttpMethod method,
        string path,
        object? body = null)
    {
        using var csrfResponse =
            await client.GetAsync("/api/auth/csrf");

        csrfResponse.EnsureSuccessStatusCode();

        var csrfData =
            await csrfResponse.Content.ReadFromJsonAsync<JsonElement>();

        var csrfToken =
            csrfData.GetProperty("csrfToken").GetString();

        using var request = new HttpRequestMessage(method, path);

        request.Headers.Add("X-CSRF-TOKEN", csrfToken);

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return await client.SendAsync(request);
    }

    internal static async Task RegisterAsync(
        HttpClient client,
        string email)
    {
        using var response = await SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/register",
            new { email, password = Password });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    internal static async Task LoginAsync(
        HttpClient client,
        string email)
    {
        using var response = await SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/login",
            new
            {
                email,
                password = Password,
                rememberMe = false
            });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    internal static async Task RegisterAndLoginAsync(
        HttpClient client,
        string email)
    {
        await RegisterAsync(client, email);
        await LoginAsync(client, email);
    }
}