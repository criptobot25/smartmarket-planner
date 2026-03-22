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
    include: { savedPlans: { orderBy: { updatedAt: "desc" } } },
  });

  return NextResponse.json(user?.savedPlans ?? []);
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
  const plan = await prisma.savedPlan.create({
    data: {
      userId: user.id,
      name: body.name || "My Plan",
      planJson: body.planJson,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
