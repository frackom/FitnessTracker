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

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteRoutine(int id)
    {
        var routine = await _context.Routines
            .Include(routine => routine.RoutineExercises)
            .SingleOrDefaultAsync(routine => routine.Id == id);

        if (routine is null)
        {
            return NotFound(new
            {
                message = $"Routine with ID {id} was not found."
            });
        }

        _context.RoutineExercises.RemoveRange(
            routine.RoutineExercises
        );

        _context.Routines.Remove(routine);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoutineResponse>> UpdateRoutine(
    int id,
    UpdateRoutineRequest request)
    {
        var routine = await _context.Routines
            .Include(routine => routine.RoutineExercises)
            .SingleOrDefaultAsync(routine => routine.Id == id);

        if (routine is null)
        {
            return NotFound(new
            {
                message = $"Routine with ID {id} was not found."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "A routine name is required."
            });
        }

        if (request.Exercises.Count == 0)
        {
            return BadRequest(new
            {
                message = "A routine must contain at least one exercise."
            });
        }

        var requestedExerciseIds = request.Exercises
            .Select(exercise => exercise.ExerciseId)
            .ToList();

        var containsDuplicates =
            requestedExerciseIds.Distinct().Count() !=
            requestedExerciseIds.Count;

        if (containsDuplicates)
        {
            return BadRequest(new
            {
                message = "A routine cannot contain the same exercise more than once."
            });
        }

        var exercises = await _context.Exercises
            .Where(exercise =>
                requestedExerciseIds.Contains(exercise.Id))
            .ToListAsync();

        if (exercises.Count != requestedExerciseIds.Count)
        {
            var existingIds = exercises
                .Select(exercise => exercise.Id)
                .ToHashSet();

            var missingIds = requestedExerciseIds
                .Where(id => !existingIds.Contains(id));

            return BadRequest(new
            {
                message =
                    $"Exercises were not found: {string.Join(", ", missingIds)}."
            });
        }

        routine.Name = request.Name.Trim();

        routine.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? string.Empty
                : request.Description.Trim();

        var requestedExerciseIdSet = requestedExerciseIds.ToHashSet();

        var removedRoutineExercises = routine.RoutineExercises
            .Where(routineExercise =>
                !requestedExerciseIdSet.Contains(
                    routineExercise.ExerciseId))
            .ToList();

        _context.RoutineExercises.RemoveRange(
            removedRoutineExercises
        );

        var existingRoutineExercises = routine.RoutineExercises
            .ToDictionary(
                routineExercise => routineExercise.ExerciseId
            );

        for (var index = 0; index < request.Exercises.Count; index++)
        {
            var requestedExercise = request.Exercises[index];

            if (existingRoutineExercises.TryGetValue(
                requestedExercise.ExerciseId,
                out var existingRoutineExercise))
            {
                existingRoutineExercise.Position = index + 1;
                existingRoutineExercise.TargetSets =
                    requestedExercise.TargetSets;
                existingRoutineExercise.TargetReps =
                    requestedExercise.TargetReps;
            }
            else
            {
                routine.RoutineExercises.Add(
                    new RoutineExercise
                    {
                        RoutineId = routine.Id,
                        ExerciseId =
                            requestedExercise.ExerciseId,
                        Position = index + 1,
                        TargetSets =
                            requestedExercise.TargetSets,
                        TargetReps =
                            requestedExercise.TargetReps
                    }
                );
            }
        }

        await _context.SaveChangesAsync();

        var exerciseDictionary = exercises.ToDictionary(
            exercise => exercise.Id
        );

        var response = new RoutineResponse
        {
            Id = routine.Id,
            Name = routine.Name,
            Description = routine.Description,
            Exercises = request.Exercises
                .Select((requestedExercise, index) =>
                {
                    var exercise =
                        exerciseDictionary[
                            requestedExercise.ExerciseId
                        ];

                    return new RoutineExerciseResponse
                    {
                        ExerciseId = exercise.Id,
                        Name = exercise.Name,
                        MuscleGroup = exercise.MuscleGroup,
                        ImageUrl = exercise.ImageUrl,
                        Position = index + 1,
                        TargetSets =
                            requestedExercise.TargetSets,
                        TargetReps =
                            requestedExercise.TargetReps
                    };
                })
                .ToList()
        };

        return Ok(response);
    }
}