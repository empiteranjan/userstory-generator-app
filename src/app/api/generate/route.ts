import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface UserStory {
  title: string;
  action: string;
  benefit: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Feature {
  title: string;
  description: string;
  userStories: UserStory[];
}

interface Epic {
  title: string;
  description: string;
  features: Feature[];
}

interface CreateProjectRequest {
  title: string;
  description: string;
  epics: Epic[];
}

export async function POST(req: Request) {
  try {
    const { title, description, epics } = await req.json() as CreateProjectRequest;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Create project with all related data
    const project = await prisma.project.create({
      data: {
        title,
        description,
        epics: {
          create: epics.map((epic) => ({
            title: epic.title,
            description: epic.description,
            status: 'PLANNED',
            features: {
              create: epic.features.map((feature) => ({
                title: feature.title,
                description: feature.description,
                status: 'PLANNED',
                userStories: {
                  create: feature.userStories.map((story) => ({
                    title: story.title,
                    action: story.action,
                    benefit: story.benefit,
                    acceptanceCriteria: '[]',
                    priority: story.priority,
                    status: 'BACKLOG',
                    // Create a default persona for now
                    persona: {
                      create: {
                        roleName: 'User',
                        responsibilities: 'General system user',
                        goals: 'Accomplish tasks efficiently'
                      }
                    }
                  }))
                }
              }))
            }
          }))
        }
      },
      include: {
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

    return NextResponse.json({ 
      project,
      success: true 
    });

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create project. Please try again.' },
      { status: 500 }
    );
  }
} 