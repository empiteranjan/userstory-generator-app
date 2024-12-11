'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [projectDetails, setProjectDetails] = useState('');
  const [userStories, setUserStories] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUserStories(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectDetails }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate user stories');
      }

      const data = await response.json();
      setUserStories(data.userStories);
    } catch (err) {
      setError('Failed to generate user stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Story Generator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="projectDetails" className="block text-sm font-medium mb-2">
            Project Details
          </label>
          <textarea
            id="projectDetails"
            value={projectDetails}
            onChange={(e) => setProjectDetails(e.target.value)}
            className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your project or feature in detail. The more specific you are, the better the generated personas and user stories will be."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing and Generating...' : 'Generate Personas & User Stories'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {userStories && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown className="bg-white p-6 rounded-lg shadow">
              {userStories}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </main>
  );
}
