export async function handleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Response is not valid JSON");
  }

  if (!response.ok) {
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
    ) {
      throw new Error((parsed as { message: string }).message);
    }
    throw new Error("API request failed");
  }

  return parsed as T;
}

