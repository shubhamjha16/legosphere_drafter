import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Sparkles, Globe, BookOpen, GitGraph } from 'lucide-react';
import { generateLegalFlow, analyzeNodeLaw } from '../services/aiService';
import { useUsage } from '../context/UsageContext';

// Custom Node Component (placeholder for now, will enhance later)
const CustomNode = ({ data }: { data: any }) => {
    return (
        <div className={`px-4 py-3 shadow-md rounded-lg border-2 bg-white min-w-[150px] text-center ${data.isSelected ? 'border-primary' : 'border-gray-200'}`}>
            <div className="font-bold text-sm text-gray-900">{data.label}</div>
            {data.citations && (
                <div className="mt-2 flex gap-1 justify-center">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {data.citations.length}
                    </span>
                    {data.foreignLaw && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const CaseFlowPage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [inputText, setInputText] = useState('');
    const [sourceCountry, setSourceCountry] = useState('India');
    const [targetCountry, setTargetCountry] = useState('USA');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { deductWords } = useUsage();

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleGenerateFlow = async () => {
        if (!inputText.trim()) return;
        setIsGenerating(true);
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        setAnalysisData(null);

        try {
            const flowData = await generateLegalFlow(inputText);

            // Transform AI data to React Flow format
            // Assuming flowData returns { nodes: [{id, label, type}], edges: [{id, source, target}] }
            // We need to layout them. For now, simple vertical layout logic or use dagre.
            // Let's assume simple vertical spacing for MVP.

            const newNodes = flowData.nodes.map((node: any, index: number) => ({
                id: node.id,
                type: 'custom', // Use our custom node
                data: { label: node.label, citations: [], foreignLaw: null },
                position: { x: 250, y: index * 150 }, // Simple vertical layout
            }));

            const newEdges = flowData.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                animated: true,
            }));

            setNodes(newNodes);
            setEdges(newEdges);
            deductWords(inputText.split(/\s+/).length); // Deduct based on input size

        } catch (error) {
            console.error("Failed to generate flow:", error);
            alert("Failed to generate flowchart. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const onNodeClick = async (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setAnalysisData(null); // Reset previous analysis

        // Check if we already have data for this node to avoid re-fetching
        if (node.data.analysis) {
            setAnalysisData(node.data.analysis);
            return;
        }

        setIsAnalyzing(true);
        try {
            const analysis = await analyzeNodeLaw(node.data.label, sourceCountry, targetCountry);

            // Update node data with new analysis
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node.id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                citations: analysis.domestic,
                                foreignLaw: analysis.foreign,
                                analysis: analysis // Cache it
                            },
                        };
                    }
                    return n;
                })
            );
            setAnalysisData(analysis);
            deductWords(50); // Small cost for analysis
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <GitGraph className="w-6 h-6 text-primary" />
                            Legal Logic Flowchart
                        </h1>
                        <p className="text-sm text-gray-500">Visualize case logic and compare jurisdictions</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Panel: Controls & Canvas */}
                <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Input Area */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-4">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste case facts or legal text here..."
                            className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24 text-sm"
                        />

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-700">Source:</label>
                                <select
                                    value={sourceCountry}
                                    onChange={(e) => setSourceCountry(e.target.value)}
                                    className="p-2 bg-white border border-gray-200 rounded-md text-sm"
                                >
                                    <option>India</option>
                                    <option>USA</option>
                                    <option>UK</option>
                                    <option>Canada</option>
                                    <option>Australia</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-700">Target:</label>
                                <select
                                    value={targetCountry}
                                    onChange={(e) => setTargetCountry(e.target.value)}
                                    className="p-2 bg-white border border-gray-200 rounded-md text-sm"
                                >
                                    <option>USA</option>
                                    <option>India</option>
                                    <option>UK</option>
                                    <option>Canada</option>
                                    <option>Australia</option>
                                </select>
                            </div>

                            <button
                                onClick={handleGenerateFlow}
                                disabled={isGenerating || !inputText.trim()}
                                className="ml-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                Generate Flow
                            </button>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-gray-50 relative">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            nodeTypes={nodeTypes}
                            fitView
                        >
                            <Background />
                            <Controls />
                        </ReactFlow>
                        {nodes.length === 0 && !isGenerating && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                                <p>Enter text and click Generate to see the flow</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Inspector */}
                <div className="w-96 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">Node Analysis</h2>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        {!selectedNode ? (
                            <div className="text-center text-gray-400 mt-10">
                                <GitGraph className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Click on a node to view legal analysis and cross-jurisdictional comparison.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Core Idea</h3>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-medium">
                                        {selectedNode.data.label}
                                    </div>
                                </div>

                                {isAnalyzing ? (
                                    <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        Analyzing Laws...
                                    </div>
                                ) : analysisData ? (
                                    <>
                                        <div>
                                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                Domestic Law ({sourceCountry})
                                            </h3>
                                            <div className="space-y-2">
                                                {analysisData.domestic.map((law: string, i: number) => (
                                                    <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-900">
                                                        {law}
                                                    </div>
                                                ))}
                                                {analysisData.domestic.length === 0 && <p className="text-sm text-gray-500 italic">No specific domestic statutes found.</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                Cross-Border ({targetCountry})
                                            </h3>
                                            <div className="space-y-2">
                                                {analysisData.foreign.map((law: string, i: number) => (
                                                    <div key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-900">
                                                        {law}
                                                    </div>
                                                ))}
                                                {analysisData.foreign.length === 0 && <p className="text-sm text-gray-500 italic">No direct foreign equivalent found.</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reasoning</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {analysisData.reasoning}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-red-400">
                                        Failed to load analysis.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseFlowPage;
