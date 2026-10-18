namespace FitnessTracker.Api.Models;

public class Routine
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public ICollection<RoutineExercise> RoutineExercises { get; set; }
        = new List<RoutineExercise>();
}