import { API_URL } from "./apiConfig";

export async function createRoutine(routine) {
  const response = await fetch(`${API_URL}/api/routines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routine),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    const validationErrors = errorData?.errors
      ? Object.values(errorData.errors).flat().join(" ")
      : null;

    throw new Error(
      validationErrors ||
        errorData?.message ||
        "Unable to create the routine."
    );
  }

  return response.json();
}