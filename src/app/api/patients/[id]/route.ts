import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        treatments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            doneBy: {
              select: { name: true },
            },
          },
        },
        dentalCharts: {
          orderBy: { tooth: 'asc' },
        },
        bills: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('GET patient error:', error);
    return NextResponse.json(
      { error: 'Failed to load patient' },
      { status: 500 }
    );
  }
}