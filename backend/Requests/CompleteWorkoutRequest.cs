using System.ComponentModel.DataAnnotations;

namespace FitnessTracker.Api.Requests;

public class CompleteWorkoutRequest
{
    [Range(1, int.MaxValue)]
    public int RoutineId { get; set; }

    [Required, MinLength(1)]
    public List<WorkoutSetRequest> Sets { get; set; } = [];
}

public class WorkoutSetRequest
{
    [Range(1, int.MaxValue)]
    public int ExerciseId { get; set; }

    [Range(1, 100)]
    public int SetNumber { get; set; }

    [Range(1, 1000)]
    public int Reps { get; set; }

    [Range(typeof(decimal), "0", "10000")]
    public decimal WeightKg { get; set; }
}