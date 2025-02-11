import { NextResponse } from "next/server";
import { Prediction } from "@/src/types/inference.type";

export async function POST(request: Request) {
  try {
    const { base64Frame } = await request.json();

    const response = await fetch("https://inference.saulofaria.com/infer/workflows/saulofaria/hand-detection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.HAND_DETECTION_API_KEY,
        inputs: {
          image: {
            type: "base64",
            value: base64Frame,
          },
        },
      }),
    });

    const predictionsData = await response.json();
    const predictions: Prediction[] = predictionsData.outputs[0].model_all.predictions;

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ error: "Failed to get prediction" }, { status: 500 });
  }
}
