namespace FitnessTracker.Api.Models;

public class WorkoutSet
{
    public int Id { get; set; }
    public int WorkoutId { get; set; }
    public Workout Workout { get; set; } = null!;
    public int ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int ExercisePosition { get; set; }
    public int SetNumber { get; set; }
    public int Reps { get; set; }
    public decimal WeightKg { get; set; }
}