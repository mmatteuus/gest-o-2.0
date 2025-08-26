
import { NextResponse } from 'next/server';

export async function GET() {
  // Simples endpoint para compatibilidade com testes
  return NextResponse.json({
    providers: {
      email: {
        id: "email",
        name: "Email",
        type: "email",
        signinUrl: "/auth/signin",
        callbackUrl: "/auth/callback"
      }
    }
  });
}
