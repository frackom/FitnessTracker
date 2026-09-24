namespace FitnessTracker.Api.Models;

public class Routine
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ICollection<RoutineExercise> RoutineExercises { get; set; }
        = new List<RoutineExercise>();
}