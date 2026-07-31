import { NextResponse } from 'next/server'

const BROWSER_ONLY_PROFILE_RESPONSE = { error: 'browser_only_profile' }

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(BROWSER_ONLY_PROFILE_RESPONSE, { status: 410 })
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(BROWSER_ONLY_PROFILE_RESPONSE, { status: 410 })
}
