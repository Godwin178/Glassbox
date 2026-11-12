type UsageEvent = "wallet_inspection" | "transaction_verification";

export async function recordUsage(event: UsageEvent): Promise<void> {
  const url = process.env.GLASSBOX_SUPABASE_URL;
  const key = process.env.GLASSBOX_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/rpc/record_glassbox_usage`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_event: event }),
      cache: "no-store",
    });
  } catch (error) {
    // Analytics must never break wallet inspection or transaction verification.
    console.error("Glassbox usage tracking unavailable:", error);
  }
}
