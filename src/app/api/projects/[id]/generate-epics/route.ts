import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserStory {
  title: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
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

export async function POST(
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
    // Fetch project and personas
    const project = await prisma.project.findUnique({
      where: { id },
      include: { personas: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const prompt = `Given the following project details:

Project Description:
${project.description}

Personas:
${project.personas.map(p => `- ${p.roleName}: ${p.responsibilities}`).join('\n')}

Please analyze the project and break it down into epics, features, and user stories. Structure your response exactly like this example:
{
  "epics": [
    {
      "title": "User Authentication and Authorization",
      "description": "Implement secure user authentication and role-based access control",
      "features": [
        {
          "title": "User Registration",
          "description": "Allow users to create new accounts",
          "userStories": [
            {
              "title": "New User Registration",
              "action": "register for an account",
              "benefit": "access the platform's features",
              "acceptanceCriteria": [
                "User can enter email and password",
                "Password must meet security requirements",
                "Email verification is required"
              ],
              "priority": "HIGH"
            }
          ]
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a skilled business analyst who breaks down projects into well-structured epics, features, and user stories. Always respond with valid JSON matching the specified format exactly."
        },
        { role: "user", content: prompt }
      ],
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    let content: { epics: Epic[] };
    try {
      content = JSON.parse(responseText);
      
      if (!content.epics || !Array.isArray(content.epics) || content.epics.length === 0) {
        return NextResponse.json(
          { error: 'Invalid response format: No epics found' },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Create epics, features, and user stories in the database
    for (const epic of content.epics) {
      await prisma.epic.create({
        data: {
          title: epic.title,
          description: epic.description,
          status: 'PLANNED',
          project: { connect: { id } },
          features: {
            create: epic.features.map(feature => ({
              title: feature.title,
              description: feature.description,
              status: 'PLANNED',
              userStories: {
                create: feature.userStories.map(story => {
                  // Find the most relevant persona for this user story
                  const relevantPersona = project.personas.find(p => 
                    story.action.toLowerCase().includes(p.roleName.toLowerCase()) ||
                    p.responsibilities.toLowerCase().includes(story.action.toLowerCase())
                  );

                  if (!relevantPersona) {
                    throw new Error('No matching persona found for user story');
                  }

                  return {
                    title: story.title,
                    action: story.action,
                    benefit: story.benefit,
                    acceptanceCriteria: JSON.stringify(story.acceptanceCriteria),
                    priority: story.priority,
                    status: 'BACKLOG',
                    persona: { connect: { id: relevantPersona.id } }
                  };
                })
              }
            }))
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to generate epics and features' },
      { status: 500 }
    );
  }
} 