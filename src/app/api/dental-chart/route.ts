import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const charts = await prisma.dentalChart.findMany({
      where: { patientId },
      orderBy: { tooth: 'asc' },
    });

    return NextResponse.json({ charts });
  } catch (error) {
    console.error('GET dental chart error:', error);
    return NextResponse.json(
      { error: 'Failed to load dental chart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    // Upsert: if entry exists for this patient+tooth, update it. Otherwise create.
    const existing = await prisma.dentalChart.findFirst({
      where: {
        patientId: body.patientId,
        tooth: body.tooth,
      },
    });

    let chart;
    if (existing) {
      chart = await prisma.dentalChart.update({
        where: { id: existing.id },
        data: {
          condition: body.condition,
          notes: body.notes || null,
        },
      });
    } else {
      chart = await prisma.dentalChart.create({
        data: {
          patientId: body.patientId,
          tooth: body.tooth,
          condition: body.condition,
          notes: body.notes || null,
        },
      });
    }

    return NextResponse.json({ chart }, { status: 201 });
  } catch (error) {
    console.error('POST dental chart error:', error);
    return NextResponse.json(
      { error: 'Failed to save dental chart' },
      { status: 500 }
    );
  }
}