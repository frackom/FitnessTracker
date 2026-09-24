using System.ComponentModel.DataAnnotations;

namespace FitnessTracker.Api.Requests;

public class CreateRoutineRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<CreateRoutineExerciseRequest> Exercises { get; set; } = [];
}

public class CreateRoutineExerciseRequest
{
    [Range(1, int.MaxValue)]
    public int ExerciseId { get; set; }

    [Range(1, 20)]
    public int TargetSets { get; set; }

    [Range(1, 100)]
    public int TargetReps { get; set; }
}