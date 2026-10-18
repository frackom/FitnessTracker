using System.ComponentModel.DataAnnotations;

namespace FitnessTracker.Api.Requests;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(128)]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; }
}