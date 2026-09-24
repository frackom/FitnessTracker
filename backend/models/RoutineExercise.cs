namespace FitnessTracker.Api.Models;

public class RoutineExercise
{
    public int RoutineId { get; set; }

    public Routine Routine { get; set; } = null!;

    public int ExerciseId { get; set; }

    public Exercise Exercise { get; set; } = null!;

    public int Position { get; set; }

    public int TargetSets { get; set; }

    public int TargetReps { get; set; }
}