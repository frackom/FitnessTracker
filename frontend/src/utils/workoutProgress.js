export function getLoggedExercises(workouts) {
  const exercises = new Map();
  [...workouts]
    .sort((a, b) => Date.parse(b.completedAtUtc) - Date.parse(a.completedAtUtc))
    .forEach((workout) => {
      workout.sets.forEach((set) => {
        if (!exercises.has(set.exerciseId)) {
          exercises.set(set.exerciseId, { id: set.exerciseId, name: set.exerciseName });
        }
      });
    });
  return [...exercises.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getExerciseProgress(workouts, exerciseId) {
  return workouts.flatMap((workout) => {
    const sets = workout.sets.filter((set) => set.exerciseId === exerciseId);
    if (!sets.length) return [];
    return [{
      workoutId: workout.id,
      completedAtUtc: workout.completedAtUtc,
      routineName: workout.routineName,
      weightKg: Math.max(...sets.map((set) => set.weightKg)),
    }];
  }).sort((a, b) => Date.parse(a.completedAtUtc) - Date.parse(b.completedAtUtc)
    || a.workoutId - b.workoutId);
}
