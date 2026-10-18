import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateFileNumber } from '@/lib/utils';

export async function GET() {
  try {
    await requireAuth();

    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('GET patients error:', error);
    return NextResponse.json(
      { error: 'Failed to load patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    const patient = await prisma.patient.create({
      data: {
        fileNumber: generateFileNumber(),
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        address: body.address || null,
        occupation: body.occupation || null,
        emergencyName: body.emergencyName || null,
        emergencyPhone: body.emergencyPhone || null,
        medicalHistory: body.medicalHistory || null,
        allergies: body.allergies || null,
        medications: body.medications || null,
        bloodGroup: body.bloodGroup || null,
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error('POST patient error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}