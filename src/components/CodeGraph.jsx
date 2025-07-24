
import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, MiniMap, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWebSocket } from '../utils/websocket';

const initialNodes = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function CodeGraph({ selectedProject }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { sendMessage, messages } = useWebSocket();

  useEffect(() => {
    if (selectedProject) {
      sendMessage({
        type: 'graph:get',
        projectId: selectedProject.id,
      });
    }
  }, [selectedProject, sendMessage]);

  useEffect(() => {
    const graphMessage = messages.find(msg => msg.type === 'graph:data');
    if (graphMessage) {
      // NOTE: The cache loading is trimmed from here
      const { nodes, edges } = graphMessage.data;
      setNodes(nodes);
      setEdges(edges);
    }
  }, [messages]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (eds) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default CodeGraph;
