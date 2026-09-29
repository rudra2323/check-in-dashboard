import { NextResponse } from "next/server";

// Optional shared passcode for the check-in link.
// Set EVENT_PASSCODE in Vercel (or .env.local) to turn it on; leave unset to disable.
// Browsers show a login prompt: any username works, the password is the passcode.
export function middleware(req) {
  const passcode = process.env.EVENT_PASSCODE;
  if (!passcode) return NextResponse.next();

  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password === passcode) return NextResponse.next();
  }

  return new NextResponse("Passcode required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Check-In Desk"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
