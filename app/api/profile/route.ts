import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma";

export async function GET() {
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

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(profile ?? {});
}

export async function PUT(req: Request) {
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

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      fitnessGoal: body.fitnessGoal,
      dietaryPrefs: body.dietaryPrefs,
      weightKg: body.weightKg,
      heightCm: body.heightCm,
      activityLevel: body.activityLevel,
      allergies: body.allergies,
      weeklyBudget: body.weeklyBudget,
      preferredLang: body.preferredLang,
    },
    create: {
      userId: user.id,
      fitnessGoal: body.fitnessGoal,
      dietaryPrefs: body.dietaryPrefs,
      weightKg: body.weightKg,
      heightCm: body.heightCm,
      activityLevel: body.activityLevel,
      allergies: body.allergies,
      weeklyBudget: body.weeklyBudget,
      preferredLang: body.preferredLang ?? "en",
    },
  });

  return NextResponse.json(profile);
}
