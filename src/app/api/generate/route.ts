import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { projectDetails } = await req.json();

    const prompt = `Given the following project details:

${projectDetails}

1. First, identify and list all the key personas and roles that would interact with this system. For each persona, provide:
   - Role name/title
   - Brief description of their responsibilities
   - Their main goals in the system

2. Then, generate a comprehensive list of user stories for each identified persona in the format:
   "As a [identified persona], I want to [action] so that [benefit]"

Generate at least 2-3 detailed user stories for each identified persona, ensuring they cover different aspects of the project.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a skilled product manager who first analyzes stakeholders and then creates detailed user stories. Format your response with clear sections for Personas and User Stories, using markdown for better readability." 
        },
        { role: "user", content: prompt }
      ],
    });

    return NextResponse.json({ userStories: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate user stories' }, { status: 500 });
  }
} 