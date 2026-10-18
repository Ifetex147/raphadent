import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fileNumber: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            treatment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('GET bill error:', error);
    return NextResponse.json(
      { error: 'Failed to load bill' },
      { status: 500 }
    );
  }
}