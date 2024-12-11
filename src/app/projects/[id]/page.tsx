'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project, Epic, Feature, UserStory, Persona } from '@prisma/client';

interface UserStoryWithPersona extends UserStory {
  persona: Persona;
}

interface FeatureWithStories extends Feature {
  userStories: UserStoryWithPersona[];
}

interface EpicWithFeatures extends Epic {
  features: FeatureWithStories[];
}

interface ProjectWithDetails extends Project {
  personas: (Persona & {
    userStories: UserStory[];
  })[];
  epics: EpicWithFeatures[];
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingEpics, setIsGeneratingEpics] = useState(false);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const generateEpicsAndFeatures = async () => {
    if (!project) return;
    setIsGeneratingEpics(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/generate-epics`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate epics');
      await fetchProject(); // Refresh project data
    } catch (err) {
      setError('Failed to generate epics and features');
    } finally {
      setIsGeneratingEpics(false);
    }
  };

  const parseAcceptanceCriteria = (criteria: string): string[] => {
    try {
      return JSON.parse(criteria);
    } catch {
      return [];
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading project details...</div>;
  if (error) return <div className="text-red-600 py-8">{error}</div>;
  if (!project) return <div className="text-center py-8">Project not found</div>;

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/projects"
            className="text-blue-500 hover:text-blue-600"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">Project Details</h1>
        </div>
        <button
          onClick={generateEpicsAndFeatures}
          disabled={isGeneratingEpics}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
        >
          {isGeneratingEpics ? 'Generating...' : 'Generate Epics & Features'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Project Description */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
          <p className="text-gray-700">{project.description}</p>
        </section>

        {/* Personas Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personas</h2>
          <div className="grid gap-6">
            {project.personas.map((persona) => (
              <div key={persona.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{persona.roleName}</h3>
                <p className="text-gray-600 mt-2"><strong>Responsibilities:</strong> {persona.responsibilities}</p>
                <p className="text-gray-600 mt-2"><strong>Goals:</strong> {persona.goals}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Epics Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Epics</h2>
          {project.epics.length === 0 ? (
            <p className="text-gray-600">No epics generated yet. Click the "Generate Epics & Features" button to create them.</p>
          ) : (
            <div className="space-y-6">
              {project.epics.map((epic) => (
                <div key={epic.id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">{epic.title}</h3>
                  <p className="text-gray-700 mt-2">{epic.description}</p>
                  
                  {/* Features */}
                  <div className="mt-4 space-y-4">
                    <h4 className="font-medium text-gray-700">Features</h4>
                    {epic.features.map((feature) => (
                      <div key={feature.id} className="ml-4 border-l-2 pl-4">
                        <h5 className="font-medium">{feature.title}</h5>
                        <p className="text-gray-600 mt-1">{feature.description}</p>
                        
                        {/* User Stories */}
                        <div className="mt-3 space-y-2">
                          {feature.userStories.map((story) => (
                            <div key={story.id} className="bg-gray-50 p-3 rounded">
                              <p>As a {story.persona.roleName}, I want to {story.action} so that {story.benefit}</p>
                              {story.acceptanceCriteria && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">Acceptance Criteria:</p>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {parseAcceptanceCriteria(story.acceptanceCriteria).map((criteria, index) => (
                                      <li key={index}>{criteria}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {story.priority && (
                                <span className="inline-block mt-2 text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  Priority: {story.priority}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
} 