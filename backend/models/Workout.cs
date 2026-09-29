namespace FitnessTracker.Api.Models;

public class Workout
{
    public int Id { get; set; }
    public string RoutineName { get; set; } = string.Empty;
    public DateTime CompletedAtUtc { get; set; }
    public ICollection<WorkoutSet> Sets { get; set; } = new List<WorkoutSet>();
}
