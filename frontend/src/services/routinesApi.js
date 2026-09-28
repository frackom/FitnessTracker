import { API_URL } from "./apiConfig";

export async function getRoutines() {
  const response = await fetch(`${API_URL}/api/routines`);

  if (!response.ok) {
    throw new Error("Unable to load routines.");
  }

  return response.json();
}

export async function getRoutineById(id) {
  const response = await fetch(`${API_URL}/api/routines/${id}`);

  if (response.status === 404) {
    throw new Error("Routine not found.");
  }

  if (!response.ok) {
    throw new Error("Unable to load the routine.");
  }

  return response.json();
}

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

export async function deleteRoutine(id) {
  const response = await fetch(`${API_URL}/api/routines/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new Error("Routine not found.");
  }

  if (!response.ok) {
    throw new Error("Unable to delete the routine.");
  }
}

export async function updateRoutine(id, routine) {
  const response = await fetch(`${API_URL}/api/routines/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routine),
  });

  if (response.status === 404) {
    throw new Error("Routine not found.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    if (errorData?.errors) {
      const messages = Object.values(errorData.errors).flat();
      throw new Error(messages.join(" "));
    }

    throw new Error(
      errorData?.message ?? "Unable to update the routine."
    );
  }

  return response.json();
}