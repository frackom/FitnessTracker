using FitnessTracker.Api.Data;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Requests;
using FitnessTracker.Api.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutinesController : ControllerBase
{
    private readonly FitnessTrackerDbContext _context;

    public RoutinesController(FitnessTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoutineResponse>>>
        GetRoutines()
    {
        List<RoutineResponse> routines = await _context.Routines
            .AsNoTracking()
            .OrderBy(routine => routine.Name)
            .Select(routine => new RoutineResponse
            {
                Id = routine.Id,
                Name = routine.Name,
                Description = routine.Description,

                Exercises = routine.RoutineExercises
                    .OrderBy(item => item.Position)
                    .Select(item => new RoutineExerciseResponse
                    {
                        ExerciseId = item.ExerciseId,
                        Name = item.Exercise.Name,
                        MuscleGroup = item.Exercise.MuscleGroup,
                        ImageUrl = item.Exercise.ImageUrl,
                        Position = item.Position,
                        TargetSets = item.TargetSets,
                        TargetReps = item.TargetReps
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(routines);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoutineResponse>> GetRoutine(int id)
    {
        RoutineResponse? routine = await _context.Routines
            .AsNoTracking()
            .Where(routine => routine.Id == id)
            .Select(routine => new RoutineResponse
            {
                Id = routine.Id,
                Name = routine.Name,
                Description = routine.Description,

                Exercises = routine.RoutineExercises
                    .OrderBy(item => item.Position)
                    .Select(item => new RoutineExerciseResponse
                    {
                        ExerciseId = item.ExerciseId,
                        Name = item.Exercise.Name,
                        MuscleGroup = item.Exercise.MuscleGroup,
                        ImageUrl = item.Exercise.ImageUrl,
                        Position = item.Position,
                        TargetSets = item.TargetSets,
                        TargetReps = item.TargetReps
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (routine is null)
        {
            return NotFound();
        }

        return Ok(routine);
    }

    [HttpPost]
    public async Task<ActionResult> CreateRoutine(
        CreateRoutineRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("A routine name is required.");
        }

        List<int> requestedExerciseIds = request.Exercises
            .Select(item => item.ExerciseId)
            .ToList();

        if (requestedExerciseIds.Count !=
            requestedExerciseIds.Distinct().Count())
        {
            return BadRequest(
                "An exercise cannot appear more than once in a routine.");
        }

        List<int> existingExerciseIds = await _context.Exercises
            .Where(exercise =>
                requestedExerciseIds.Contains(exercise.Id))
            .Select(exercise => exercise.Id)
            .ToListAsync();

        List<int> missingExerciseIds = requestedExerciseIds
            .Except(existingExerciseIds)
            .ToList();

        if (missingExerciseIds.Count > 0)
        {
            return BadRequest(new
            {
                message = "One or more exercises do not exist.",
                exerciseIds = missingExerciseIds
            });
        }

        var routine = new Routine
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),

            RoutineExercises = request.Exercises
                .Select((item, index) => new RoutineExercise
                {
                    ExerciseId = item.ExerciseId,
                    Position = index + 1,
                    TargetSets = item.TargetSets,
                    TargetReps = item.TargetReps
                })
                .ToList()
        };

        _context.Routines.Add(routine);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetRoutine),
            new { id = routine.Id },
            new
            {
                routine.Id,
                routine.Name,
                routine.Description
            });
    }
}