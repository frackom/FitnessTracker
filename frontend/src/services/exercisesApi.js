import { API_URL } from "./apiConfig";

export async function getExercises() {
  const response = await fetch(`${API_URL}/api/exercises`);

  if (!response.ok) {
    throw new Error("Unable to load exercises.");
  }

  return response.json();
}