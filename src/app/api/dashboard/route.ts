import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = session.role === 'ADMIN';

    const today = new Date();

    const totalPatients = await prisma.patient.count();
    
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    // Revenue: ADMIN ONLY
    let totalRevenue = 0;
    if (isAdmin) {
      const revenue = await prisma.bill.aggregate({
        _sum: { paidAmount: true },
      });
      totalRevenue = revenue._sum.paidAmount || 0;
    }

    const pendingBills = await prisma.bill.count({
      where: {
        status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
      },
    });

    const recentPatients = await prisma.patient.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fileNumber: true,
        phone: true,
        createdAt: true,
      },
    });

    const todayAppointmentsList = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
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
      },
      orderBy: { time: 'asc' },
    });

    return NextResponse.json({
      stats: {
        totalPatients,
        todayAppointments,
        totalRevenue,
        pendingBills,
      },
      recentPatients,
      todayAppointments: todayAppointmentsList,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}