import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid project ID' },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        personas: {
          include: {
            userStories: true
          }
        },
        epics: {
          include: {
            features: {
              include: {
                userStories: {
                  include: {
                    persona: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
} 