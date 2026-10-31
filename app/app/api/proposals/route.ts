
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    project: "Glassbox",
    proposals: [],
    message: "No community proposals published yet."
  });
}