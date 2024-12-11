'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Epic {
  title: string;
  description: string;
  features: Feature[];
}

interface Feature {
  title: string;
  description: string;
  userStories: UserStory[];
}

interface UserStory {
  title: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'epics' | 'preview'>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [epics, setEpics] = useState<Epic[]>([]);
  const [currentEpic, setCurrentEpic] = useState<Epic>({
    title: '',
    description: '',
    features: []
  });
  const [currentFeature, setCurrentFeature] = useState<Feature>({
    title: '',
    description: '',
    userStories: []
  });
  const [currentStory, setCurrentStory] = useState<UserStory>({
    title: '',
    action: '',
    benefit: '',
    acceptanceCriteria: [],
    priority: 'MEDIUM'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProjectDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('epics');
  };

  const addUserStory = () => {
    if (currentStory.title && currentStory.action && currentStory.benefit) {
      setCurrentFeature(prev => ({
        ...prev,
        userStories: [...prev.userStories, { ...currentStory }]
      }));
      setCurrentStory({
        title: '',
        action: '',
        benefit: '',
        acceptanceCriteria: [],
        priority: 'MEDIUM'
      });
    }
  };

  const addFeature = () => {
    if (currentFeature.title && currentFeature.description) {
      setCurrentEpic(prev => ({
        ...prev,
        features: [...prev.features, { ...currentFeature }]
      }));
      setCurrentFeature({
        title: '',
        description: '',
        userStories: []
      });
    }
  };

  const addEpic = () => {
    if (currentEpic.title && currentEpic.description) {
      setEpics(prev => [...prev, { ...currentEpic }]);
      setCurrentEpic({
        title: '',
        description: '',
        features: []
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          epics
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      router.push('/projects');
    } catch (err) {
      setError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProjectDetails = () => (
    <form onSubmit={handleProjectDetails} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Project Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter project title"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Project Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your project in detail. Include the main features, target users, and any specific requirements you have in mind."
          required
        />
      </div>

      <div className="flex gap-4">
        <Link
          href="/projects"
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next: Add Epics
        </button>
      </div>
    </form>
  );

  const renderEpicsForm = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Add Epic</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Epic Title</label>
          <input
            type="text"
            value={currentEpic.title}
            onChange={(e) => setCurrentEpic(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter epic title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Epic Description</label>
          <textarea
            value={currentEpic.description}
            onChange={(e) => setCurrentEpic(prev => ({ ...prev, description: e.target.value }))}
            className="w-full h-24 p-2 border rounded-lg"
            placeholder="Describe the epic"
          />
        </div>
        
        {/* Features Section */}
        <div className="pl-4 border-l-2 space-y-4">
          <h3 className="text-lg font-medium">Features</h3>
          {currentEpic.features.map((feature, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
              {/* User Stories */}
              <div className="mt-2 pl-4 space-y-2">
                {feature.userStories.map((story, storyIdx) => (
                  <div key={storyIdx} className="text-sm">
                    <p className="font-medium">{story.title}</p>
                    <p>As a user, I want to {story.action} so that {story.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Add Feature Form */}
          <div className="p-4 border rounded-lg">
            <div className="space-y-4">
              <input
                type="text"
                value={currentFeature.title}
                onChange={(e) => setCurrentFeature(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Feature title"
              />
              <textarea
                value={currentFeature.description}
                onChange={(e) => setCurrentFeature(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Feature description"
              />
              
              {/* User Story Form */}
              <div className="pl-4 border-l space-y-2">
                <input
                  type="text"
                  value={currentStory.title}
                  onChange={(e) => setCurrentStory(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="User story title"
                />
                <input
                  type="text"
                  value={currentStory.action}
                  onChange={(e) => setCurrentStory(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="I want to..."
                />
                <input
                  type="text"
                  value={currentStory.benefit}
                  onChange={(e) => setCurrentStory(prev => ({ ...prev, benefit: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="So that..."
                />
                <select
                  value={currentStory.priority}
                  onChange={(e) => setCurrentStory(prev => ({ ...prev, priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
                <button
                  type="button"
                  onClick={addUserStory}
                  className="w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Add User Story
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="mt-4 w-full px-4 py-2 bg-blue-100 rounded hover:bg-blue-200"
            >
              Add Feature
            </button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={addEpic}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Epic
          </button>
          <button
            type="button"
            onClick={() => setStep('preview')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Preview Project
          </button>
        </div>
      </div>

      {/* Display added epics */}
      {epics.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Added Epics</h2>
          <div className="space-y-4">
            {epics.map((epic, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h3 className="font-medium">{epic.title}</h3>
                <p className="text-gray-600">{epic.description}</p>
                <div className="mt-2 pl-4">
                  {epic.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="mt-2">
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>

      {epics.map((epic, epicIdx) => (
        <div key={epicIdx} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{epic.title}</h3>
          <p className="text-gray-600 mb-6">{epic.description}</p>

          <div className="space-y-6">
            {epic.features.map((feature, featureIdx) => (
              <div key={featureIdx} className="pl-4 border-l-2">
                <h4 className="font-medium text-lg mb-2">{feature.title}</h4>
                <p className="text-gray-600 mb-4">{feature.description}</p>

                <div className="space-y-4">
                  {feature.userStories.map((story, storyIdx) => (
                    <div key={storyIdx} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium">{story.title}</h5>
                      <p className="mt-2">As a user, I want to {story.action} so that {story.benefit}</p>
                      <span className="inline-block mt-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Priority: {story.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStep('epics')}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Edit
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300"
        >
          {isLoading ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/projects"
            className="text-blue-500 hover:text-blue-600"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">Create New Project</h1>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded ${step === 'details' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            Details
          </span>
          <span className={`px-3 py-1 rounded ${step === 'epics' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            Epics
          </span>
          <span className={`px-3 py-1 rounded ${step === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            Preview
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {step === 'details' && renderProjectDetails()}
      {step === 'epics' && renderEpicsForm()}
      {step === 'preview' && renderPreview()}
    </main>
  );
} 