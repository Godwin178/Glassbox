import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.GLASSBOX_SUPABASE_URL;
  const key = process.env.GLASSBOX_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_glassbox_usage_history`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_days: 14 }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Usage history unavailable");
    const days = await response.json();
    return NextResponse.json({ configured: true, days });
  } catch {
    return NextResponse.json({ configured: false }, { status: 502 });
  }
}
