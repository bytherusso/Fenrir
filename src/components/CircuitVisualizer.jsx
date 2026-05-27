// src/components/CircuitVisualizer.jsx
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow, Panel } from 'reactflow';
import { toPng } from 'html-to-image';
import { LogicNode } from './LogicNode';
import { useSimulatorStore } from '../store/useSimulatorStore';
import 'reactflow/dist/style.css';

export const CircuitVisualizer = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const equation = useSimulatorStore(state => state.equation);
  const setEquation = useSimulatorStore(state => state.setEquation);

  const nodeTypes = useMemo(() => ({ logicGate: LogicNode }), []);
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  // AQUÍ ESTÁ LA LIMITACIÓN FÍSICA: Bloquea conexiones si el puerto ya está ocupado
  const onConnect = useCallback((params) => setEdges((eds) => {
    const isOccupied = eds.some(e => e.target === params.target && e.targetHandle === params.targetHandle);
    if (isOccupied) return eds;
    return addEdge({ ...params, animated: false, style: { stroke: '#333333', strokeWidth: 1.5 } }, eds);
  }), []);

  const onEdgeDoubleClick = useCallback((event, edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, []);

  const handleToggle = useCallback((nodeId) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, value: n.data.value === 1 ? 0 : 1 } } : n));
  }, []);

  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const dataString = event.dataTransfer.getData('application/reactflow');
    if (!dataString) return;

    const nodeData = JSON.parse(dataString);
    const position = screenToFlowPosition({ x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top });
    const newNode = { id: `${nodeData.label}-${Date.now()}`, type: 'logicGate', position, data: { ...nodeData, value: 0, onToggle: handleToggle } };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, handleToggle]);

  const downloadImage = () => {
    const viewportNode = document.querySelector('.react-flow__viewport');
    if (viewportNode) {
      toPng(viewportNode, {
        backgroundColor: '#09090b', width: viewportNode.clientWidth, height: viewportNode.clientHeight,
        style: { width: '100%', height: '100%', transform: 'translate(0, 0) scale(1)' }
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `logic-core-blueprint-${Date.now()}.png`;
        link.href = dataUrl; link.click();
      });
    }
  };

  // ==========================================
  // AST LAYOUT: ÁRBOL VISUAL EDUCATIVO
  // Repite variables para evitar cables cruzados
  // ==========================================
  const generateCircuitFromText = () => {
    if (!equation) return;
    const cleanEq = equation.replace(/\s+/g, '');
    const tokens = cleanEq.match(/([A-Z]|[*+^()'])/g);
    if (!tokens) return;

    const precedence = { "'": 3, "*": 2, "^": 2, "+": 1 };
    const output = [], opStack = [];

    tokens.forEach(t => {
      if (/[A-Z]/.test(t)) output.push(t);
      else if (t === '(') opStack.push(t);
      else if (t === ')') {
        while (opStack.length && opStack[opStack.length - 1] !== '(') output.push(opStack.pop());
        opStack.pop(); 
      } else {
        while (opStack.length && precedence[opStack[opStack.length - 1]] >= precedence[t]) {
          if (t === "'" && opStack[opStack.length - 1] === "'") break; 
          output.push(opStack.pop());
        }
        opStack.push(t);
      }
    });
    while (opStack.length) output.push(opStack.pop());

    const newNodes = [], newEdges = [], evalStack = [];
    let yOffsetInput = 50;

    output.forEach(t => {
      if (/[A-Z]/.test(t)) {
         // CREAMOS UNA CAJA NUEVA CADA VEZ QUE APARECE LA LETRA
         const id = `INPUT-${t}-${Date.now()}-${Math.random()}`;
         newNodes.push({ 
           id, type: 'logicGate', 
           position: { x: 50, y: yOffsetInput }, 
           data: { label: 'INPUT', customName: t, inputs: 0, value: 0, onToggle: handleToggle } 
         });
         yOffsetInput += 140; // Espaciado vertical entre inputs
         evalStack.push({ id, depth: 0 });
      } else if (t === "'") {
         const op = evalStack.pop();
         if (!op) return;
         const id = `NOT-${Date.now()}-${Math.random()}`;
         const newDepth = op.depth + 1;
         const parentNode = newNodes.find(n=>n.id===op.id);
         
         const xPos = 50 + newDepth * 280;
         const yPos = parentNode.position.y;

         newNodes.push({ id, type: 'logicGate', position: { x: xPos, y: yPos }, data: { label: 'NOT', icNumber: '7404', inputs: 1, value: 0 } });
         newEdges.push({ id: `e-${op.id}-${id}`, source: op.id, target: id, sourceHandle: 'out', targetHandle: 'in-0' });
         evalStack.push({ id, depth: newDepth });
      } else {
         const right = evalStack.pop(), left = evalStack.pop();
         if (!left || !right) return;
         let label, icNumber;
         if (t === '*') { label = 'AND'; icNumber = '7408'; }
         if (t === '+') { label = 'OR'; icNumber = '7432'; }
         if (t === '^') { label = 'XOR'; icNumber = '7486'; }

         const id = `${label}-${Date.now()}-${Math.random()}`;
         const newDepth = Math.max(left.depth, right.depth) + 1;
         const leftNode = newNodes.find(n=>n.id===left.id);
         const rightNode = newNodes.find(n=>n.id===right.id);
         
         const xPos = 50 + newDepth * 280;
         // Centra la compuerta exactamente entre sus dos cables de entrada
         const yPos = (leftNode.position.y + rightNode.position.y) / 2;

         newNodes.push({ id, type: 'logicGate', position: { x: xPos, y: yPos }, data: { label, icNumber, inputs: 2, value: 0 } });
         newEdges.push({ id: `e-${left.id}-${id}`, source: left.id, target: id, sourceHandle: 'out', targetHandle: 'in-0' });
         newEdges.push({ id: `e-${right.id}-${id}`, source: right.id, target: id, sourceHandle: 'out', targetHandle: 'in-1' });
         evalStack.push({ id, depth: newDepth });
      }
    });

    if (evalStack.length === 1) {
       const finalOp = evalStack.pop();
       const id = `OUTPUT-${Date.now()}`;
       const finalNode = newNodes.find(n=>n.id===finalOp.id);
       newNodes.push({ id, type: 'logicGate', position: { x: finalNode.position.x + 280, y: finalNode.position.y }, data: { label: 'OUTPUT', inputs: 1, value: 0 } });
       newEdges.push({ id: `e-${finalOp.id}-${id}`, source: finalOp.id, target: id, sourceHandle: 'out', targetHandle: 'in-0' });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  };

  const inputValuesStr = nodes.filter(n => n.data.label === 'INPUT').map(n => n.data.value).join('');
  const topologyStr = edges.map(e => e.source + e.target).join('');

  useEffect(() => {
    if (nodes.length === 0) return;
    let nodeValues = new Map();
    nodes.forEach(n => { if (n.data.label === 'INPUT') nodeValues.set(n.id, n.data.value || 0); });

    let changed = true;
    let limit = 0;
    while (changed && limit < 100) {
      changed = false; limit++;
      nodes.forEach(n => {
        if (n.data.label === 'INPUT') return;
        const incomingEdges = edges.filter(e => e.target === n.id);
        const inputSignals = incomingEdges.map(e => nodeValues.get(e.source) || 0);
        let val; 
        const in1 = inputSignals[0] || 0, in2 = inputSignals[1] || 0;

        switch(n.data.label) {
          case 'AND': val = (in1 & in2) ? 1 : 0; break;
          case 'OR': val = (in1 | in2) ? 1 : 0; break;
          case 'NOT': val = incomingEdges.length > 0 && in1 === 0 ? 1 : 0; break;
          case 'NAND': val = !(in1 & in2) ? 1 : 0; break;
          case 'NOR': val = !(in1 | in2) ? 1 : 0; break;
          case 'XOR': val = (in1 !== in2) ? 1 : 0; break;
          case 'OUTPUT': val = in1; break;
          default: val = 0; break;
        }
        if (nodeValues.get(n.id) !== val) { nodeValues.set(n.id, val); changed = true; }
      });
    }

    setTimeout(() => {
      setEdges(eds => eds.map(e => {
        const isActive = nodeValues.get(e.source) === 1;
        const sourceNode = nodes.find(n => n.id === e.source);
        let cableColor = '#333333';
        if (isActive && sourceNode) {
            if (sourceNode.data.label.includes('AND')) cableColor = '#3b82f6';
            else if (sourceNode.data.label.includes('OR')) cableColor = '#f59e0b';
            else if (sourceNode.data.label.includes('XOR')) cableColor = '#a855f7';
            else if (sourceNode.data.label === 'NOT') cableColor = '#ec4899';
            else cableColor = '#10b981';
        }

        if (e.animated !== isActive || e.style.stroke !== cableColor) {
          return { ...e, animated: isActive, style: { stroke: cableColor, strokeWidth: isActive ? 2.5 : 1.5 } };
        }
        return e;
      }));

      setNodes(nds => nds.map(n => {
        if (n.data.label !== 'INPUT') {
          const currentVal = nodeValues.get(n.id) || 0;
          if (n.data.value !== currentVal) return { ...n, data: { ...n.data, value: currentVal } };
        }
        return n;
      }));

      const outputNode = nodes.find(n => n.data.label === 'OUTPUT');
      if (outputNode) {
        const outEdge = edges.find(e => e.target === outputNode.id);
        if (outEdge) {
          const buildExpr = (nodeId) => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return '';
            if (node.data.label === 'INPUT') return node.data.customName || 'A';
            const incEdges = edges.filter(e => e.target === nodeId).sort((a,b) => a.targetHandle.localeCompare(b.targetHandle));

            if (node.data.label === 'NOT') return incEdges.length ? `(${buildExpr(incEdges[0].source)})'` : '';
            if (incEdges.length < 2) return '';
            const left = buildExpr(incEdges[0].source), right = buildExpr(incEdges[1].source);

            switch(node.data.label) {
              case 'AND': return `(${left} * ${right})`;
              case 'OR': return `(${left} + ${right})`;
              case 'NAND': return `(${left} * ${right})'`;
              case 'NOR': return `(${left} + ${right})'`;
              case 'XOR': return `(${left} ^ ${right})`;
              default: return '';
            }
          };
          const newEq = buildExpr(outEdge.source);
          if (newEq && newEq !== useSimulatorStore.getState().equation) setEquation(newEq);
        }
      }
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValuesStr, topologyStr]); 

  return (
    <div style={{ width: '100%', height: '100%' }} ref={reactFlowWrapper}>
      <ReactFlow 
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
        onConnect={onConnect} onEdgeDoubleClick={onEdgeDoubleClick}
        onDrop={onDrop} onDragOver={onDragOver} fitView
      >
        <Background color="#1f1f1f" gap={24} size={1} />
        <Controls showInteractive={false} className="custom-controls" />
        
        <Panel position="top-right" style={{ margin: '24px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={generateCircuitFromText}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', borderRadius: '4px', fontWeight: '600' }}
          >
            [ AUTO-ARMAR CIRCUITO ]
          </button>
          <button 
            onClick={downloadImage}
            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 16px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', borderRadius: '4px' }}
          >
            [ EXPORTAR ]
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};