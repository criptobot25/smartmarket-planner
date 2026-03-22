import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "30", 10);

  const entries = await prisma.progressEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const entry = await prisma.progressEntry.create({
    data: {
      userId: user.id,
      date: body.date ? new Date(body.date) : new Date(),
      weightKg: body.weightKg,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
      adherence: body.adherence,
      notes: body.notes,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
