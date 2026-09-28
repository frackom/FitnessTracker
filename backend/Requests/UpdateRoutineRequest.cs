using System.ComponentModel.DataAnnotations;

namespace FitnessTracker.Api.Requests;

public class UpdateRoutineRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [MinLength(1)]
    public List<UpdateRoutineExerciseRequest> Exercises { get; set; } = [];
}

public class UpdateRoutineExerciseRequest
{
    [Range(1, int.MaxValue)]
    public int ExerciseId { get; set; }

    [Range(1, 20)]
    public int TargetSets { get; set; }

    [Range(1, 100)]
    public int TargetReps { get; set; }
}