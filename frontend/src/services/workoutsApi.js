import { API_URL } from "./apiConfig";

export async function completeWorkout(workout) {
  const response = await fetch(`${API_URL}/api/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workout),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ||
      (data?.errors && Object.values(data.errors).flat().join(" ")) ||
      "Unable to save workout.");
  }
  return response.json();
}

export async function getWorkouts() {
  const response = await fetch(`${API_URL}/api/workouts`);
  if (!response.ok) throw new Error("Unable to load workout history.");
  return response.json();
}
