// Swagger API endpoint: returns the OpenAPI JSON spec used by the client-side docs page.
import { swaggerSpec } from "@/app/lib/swagger"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(swaggerSpec)
}