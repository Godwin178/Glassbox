import { NextResponse } from "next/server";
import milestonesData from "@/data/milestones.json";

export const dynamic = "force-dynamic";

export async function GET() {
  const milestones = milestonesData.milestones;

  return NextResponse.json({
    project: "Glassbox",
    milestones,
    message: milestones.length
      ? null
      : "No milestones have been published yet.",
  });
}
