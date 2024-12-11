'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Project } from '@prisma/client';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link 
          href="/projects/new" 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No projects yet</p>
          <Link 
            href="/projects/new"
            className="text-blue-500 hover:underline"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-gray-700 line-clamp-2">{project.description}</p>
                </div>
                <span className="text-blue-500">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
} 