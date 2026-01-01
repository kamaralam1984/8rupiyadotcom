import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse(
    "google.com, pub-4472734290958984, DIRECT, f08c47fec0942fa0",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}
