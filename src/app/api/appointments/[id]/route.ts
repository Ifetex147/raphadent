import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const body = await request.json();

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: body.status,
        ...(body.notes && { notes: body.notes }),
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

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('PATCH appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}