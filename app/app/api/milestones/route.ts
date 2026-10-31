
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    project: "Glassbox",
    milestones: [],
    message: "No milestones have been published yet."
  });
}