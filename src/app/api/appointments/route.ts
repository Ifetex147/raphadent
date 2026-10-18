import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const statusParam = searchParams.get('status');

    let where: any = {};

    if (dateParam) {
      const date = new Date(dateParam);
      where.date = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      };
    }

    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fileNumber: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('GET appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to load appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();

    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        date: new Date(body.date),
        time: body.time,
        duration: parseInt(body.duration) || 30,
        type: body.type,
        notes: body.notes || null,
        createdById: session.id,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            fileNumber: true,
          },
        },
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('POST appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}