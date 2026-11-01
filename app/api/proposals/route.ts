import { NextResponse } from "next/server";
import proposalsData from "@/data/proposals.json";

export const dynamic = "force-dynamic";

export async function GET() {
  const proposals = proposalsData.proposals;

  return NextResponse.json({
    project: "Glassbox",
    proposals,
    message: proposals.length
      ? null
      : "No community proposals have been published yet.",
  });
}
