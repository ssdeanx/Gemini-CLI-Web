
import React, { useState } from 'react';
import { api } from '../../utils/api';
import ProgressIndicator from './ProgressIndicator';

function SpecDesign({ selectedProject }) {
  const [stage, setStage] = useState('design'); // design, requirements, tasks, review
  const [userQuery, setUserQuery] = useState(''); // The actual user input/query
  const [design, setDesign] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tasks, setTasks] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState({ design: false, requirements: false, tasks: false, save: false });

  // Generate folder name from user query
  const generateSpecName = (query) => {
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50) // Limit length
      .replace(/-+$/, ''); // Remove trailing hyphens
  };

  const generateSpec = async (type, context) => {
    setIsLoading(prev => ({ ...prev, [type]: true }));
    let prompt = '';
    if (type === 'design') {
      prompt = `Generate a comprehensive Design Document following the professional format and structure shown in the example. Create content relevant to the user's specific needs, not a workflow builder.

Required sections (follow this structure but adapt content):
1. **Overview** - Clear description with key design decisions
2. **Architecture** - High-level and component architecture with diagrams
3. **Components and Interfaces** - Core data models and TypeScript interfaces
4. **User Interface Design** - Interface and visual design
5. **Performance Considerations** - Optimization strategies
6. **Security and Access Control** - Security measures
7. **Testing Strategy** - Testing approaches
8. **Deployment and Monitoring** - Pipeline and monitoring

Format as professional markdown with code blocks, interfaces, and technical specifications. Include mermaid diagrams where appropriate.

User Input: ${context || 'Please describe what you want to design'}

# Design Document`;
    } else if (type === 'requirements') {
      prompt = `Based on the following design document, generate a comprehensive Requirements Document following the professional format shown in the example.

Required structure:
1. **Introduction** - Brief overview connecting to the design
2. **Requirements** - Generate 5-10 numbered requirements (Requirement 1, 2, 3, etc.) depending on the complexity and scope of the system

Each requirement must follow this format:
- **User Story:** As a [user type], I want [goal] so that [benefit]
- **Acceptance Criteria:**
  - WHEN [condition] THEN the system SHALL [expected behavior]
  - (5 detailed acceptance criteria per requirement)
  - Use "SHALL" for mandatory requirements

Generate the appropriate number of requirements (5-10) based on:
- Simple features: 5-6 requirements
- Medium complexity: 7-8 requirements
- Complex systems: 9-10 requirements

Focus on functional, integration, performance, security, and user experience requirements based on the design.

Design Document:
\`\`\`markdown
${context}
\`\`\`

# Requirements Document`;
    } else if (type === 'tasks') {
      prompt = `Based on the following design and requirements documents, generate a detailed Implementation Plan following the checklist format shown in the example.

The tasks should be:
- Organized as numbered checklist items with nested sub-tasks
- Detailed enough for implementation
- Include specific references to requirements (e.g., "_Requirements: 1.1, 2.4_")
- Logically ordered with dependencies
- Cover setup, core functionality, testing, deployment

Format as markdown checklist with clear task hierarchy and requirement references.

Design Document:
\`\`\`markdown
${design}
\`\`\`

Requirements Document:
\`\`\`markdown
${requirements}
\`\`\`

# Implementation Plan`;
    }

    try {
      const response = await api.generateSpec(type, prompt);
      const data = await response.json();
      return data.spec;
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      return `Error generating ${type} spec: ${error.message}`;
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleGenerate = async (type) => {
    let context = userQuery; // Use userQuery for design
    if (type === 'requirements') {
      context = design;
    } else if (type === 'tasks') {
      context = `Design:\n${design}\n\nRequirements:\n${requirements}`;
    }
    const spec = await generateSpec(type, context);
    if (type === 'design') {
      setDesign(spec);
    } else if (type === 'requirements') {
      setRequirements(spec);
    } else {
      setTasks(spec);
    }
  };

  const handleNext = () => {
    if (stage === 'design') {
      setStage('requirements');
    } else if (stage === 'requirements') {
      setStage('tasks');
    } else if (stage === 'tasks') {
      setStage('review');
    }
  };

  const handleSaveSpecs = async () => {
    if (!selectedProject || !userQuery.trim()) {
      setSaveStatus('Please enter a query and select a project.');
      return;
    }

    setIsLoading(prev => ({ ...prev, save: true }));
    setSaveStatus('');

    const specName = generateSpecName(userQuery);
    const baseDir = `specs/${specName}`;

    try {
      const designResponse = await api.saveFile(selectedProject.name, `${baseDir}/design.md`, design);
      if (!designResponse.ok) {
        throw new Error('Failed to save design.md');
      }

      const requirementsResponse = await api.saveFile(selectedProject.name, `${baseDir}/requirements.md`, requirements);
      if (!requirementsResponse.ok) {
        throw new Error('Failed to save requirements.md');
      }

      const tasksResponse = await api.saveFile(selectedProject.name, `${baseDir}/tasks.md`, tasks);
      if (!tasksResponse.ok) {
        throw new Error('Failed to save tasks.md');
      }

      setSaveStatus(`Specs saved successfully to specs/${specName}/`);
    } catch (error) {
      console.error('Error saving specs:', error);
      setSaveStatus(`Failed to save specs: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, save: false }));
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-6">
      {/* Progress Indicator at the top */}
      <ProgressIndicator 
        currentStage={stage}
        isLoading={Object.values(isLoading).some(Boolean)}
        loadingStates={isLoading}
        onStageClick={(newStage) => {
          // Only allow navigation to completed stages or next stage
          const stages = ['design', 'requirements', 'tasks', 'review'];
          const currentIndex = stages.indexOf(stage);
          const targetIndex = stages.indexOf(newStage);

          if (targetIndex <= currentIndex + 1) {
            setStage(newStage);
          }
        }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
        {stage === 'design' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">1. Design (design.md)</h2>
              <button
                onClick={() => handleGenerate('design')}
                className="px-4 py-2 bg-gemini-500 text-white rounded-md hover:bg-gemini-600"
                disabled={isLoading.design || !userQuery.trim()}
              >
                {isLoading.design ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Describe what you want to build (e.g., 'User authentication system with JWT tokens')..."
            />
            {design && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Generated Design:</h3>
                <textarea
                  className="w-full h-32 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white text-sm"
                  value={design}
                  onChange={(e) => setDesign(e.target.value)}
                  readOnly
                />
              </div>
            )}
          </div>
        )}
        {stage === 'requirements' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">2. Requirements (requirements.md)</h2>
              <button
                onClick={() => handleGenerate('requirements')}
                className="px-4 py-2 bg-gemini-500 text-white rounded-md hover:bg-gemini-600"
                disabled={!design || isLoading.requirements}
              >
                {isLoading.requirements ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Enter your requirements here..."
            />
          </div>
        )}
        {stage === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">3. Tasks (tasks.md)</h2>
              <button
                onClick={() => handleGenerate('tasks')}
                className="px-4 py-2 bg-gemini-500 text-white rounded-md hover:bg-gemini-600"
                disabled={!requirements || isLoading.tasks}
              >
                {isLoading.tasks ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder="Enter your tasks here..."
            />
          </div>
        )}
        {stage === 'review' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Review Full Spec</h2>
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="text-sm"><strong>Query:</strong> {userQuery}</p>
              <p className="text-sm"><strong>Will save to:</strong> specs/{generateSpecName(userQuery)}/</p>
            </div>
            <textarea
              className="w-full h-96 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              value={`# Design\n\n${design}\n\n# Requirements\n\n${requirements}\n\n# Tasks\n\n${tasks}`}
              readOnly
            />
          </div>
        )}
      </div>
      <div className="mt-4">
        {stage === 'review' && (
          <div className="mb-4">
            <label htmlFor="specName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Spec Name (for folder)
            </label>
            <input
              type="text"
              id="specName"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              placeholder="e.g., MyNewFeature"
            />
            {saveStatus && <p className="text-sm mt-2">{saveStatus}</p>}
          </div>
        )}
        {stage !== 'review' ? (
          <button
            onClick={handleNext}
            className="w-full px-4 py-2 bg-gemini-600 text-white rounded-md hover:bg-gemini-700"
            disabled={(stage === 'design' && !design) || (stage === 'requirements' && !requirements) || (stage === 'tasks' && !tasks)}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSaveSpecs}
            className="w-full px-4 py-2 bg-gemini-600 text-white rounded-md hover:bg-gemini-700"
            disabled={!design || !requirements || !tasks || !userQuery.trim() || isLoading.save}
          >
            {isLoading.save ? 'Saving...' : 'Save Specs to Project'}
          </button>
        )}
      </div>
    </div>
  );
}

export default SpecDesign;
