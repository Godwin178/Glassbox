app/api/funding/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    project: "Glassbox",
    currency: "SOL",
    totalReceived: 0,
    totalSpent: 0,
    balance: 0,
    records: [],
    message: "No funding records have been published yet."
  });
}