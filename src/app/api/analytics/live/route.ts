import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 0; // Disable cache for this route

export async function GET() {
  try {
    // Live visitors = unique sessions/IPs in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('page_views')
      .select('ip_address')
      .gte('timestamp', fiveMinutesAgo);
      
    if (error) {
      console.error("Live analytics error:", error);
      return NextResponse.json({ live: 0 }, { status: 500 });
    }

    const uniqueVisitors = new Set(data?.map(row => row.ip_address)).size;

    return NextResponse.json({ live: uniqueVisitors });
  } catch (err) {
    console.error("Live analytics route error:", err);
    return NextResponse.json({ live: 0 }, { status: 500 });
  }
}
