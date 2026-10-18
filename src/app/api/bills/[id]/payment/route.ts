import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const body = await request.json();
    const amount = parseFloat(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    const newPaidAmount = bill.paidAmount + amount;
    const newStatus =
      newPaidAmount >= bill.totalAmount
        ? 'PAID'
        : newPaidAmount > 0
        ? 'PARTIAL'
        : 'UNPAID';

    const updatedBill = await prisma.bill.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
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

    return NextResponse.json({ bill: updatedBill });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}