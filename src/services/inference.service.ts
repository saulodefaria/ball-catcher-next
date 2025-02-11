export async function getPrediction(base64Frame: string) {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base64Frame,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get prediction");
  }

  return response.json();
}
