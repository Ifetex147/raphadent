import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateBillNumber } from '@/lib/utils';

export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = session.role === 'ADMIN';
    const isReceptionist = session.role === 'RECEPTIONIST';

    // Dentists cannot access billing
    if (!isAdmin && !isReceptionist) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
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
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    return NextResponse.json({ bills });
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('GET bills error:', error);
    return NextResponse.json(
      { error: 'Failed to load bills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const isAdmin = session.role === 'ADMIN';
    const isReceptionist = session.role === 'RECEPTIONIST';

    if (!isAdmin && !isReceptionist) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    const totalAmount = body.items.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0
    );

    const bill = await prisma.bill.create({
      data: {
        patientId: body.patientId,
        billNumber: generateBillNumber(),
        totalAmount,
        paidAmount: body.paidAmount || 0,
        status: body.paidAmount >= totalAmount ? 'PAID' : body.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
        notes: body.notes || null,
        items: {
          create: body.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            treatmentId: item.treatmentId || null,
          })),
        },
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            fileNumber: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('POST bill error:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
}