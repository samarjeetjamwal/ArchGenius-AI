import React, { useState } from 'react';
import { PlanOption } from '../types';
import { Check, X, Maximize2, Box, Info, Image as ImageIcon, Loader2, PenTool, RefreshCw, Download, FileText } from 'lucide-react';
import { generateVisualization } from '../services/geminiService';
import { jsPDF } from "jspdf";

interface PlanDisplayProps {
  plans: PlanOption[];
  onReset: () => void;
  stylePreference: string;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plans, onReset, stylePreference }) => {
  const [activeTab, setActiveTab] = useState<number>(plans[0]?.id || 1);
  const [visualizations, setVisualizations] = useState<Record<number, string>>({});
  const [loadingVis, setLoadingVis] = useState<Record<number, boolean>>({});

  const activePlan = plans.find(p => p.id === activeTab) || plans[0];

  const handleVisualize = async (plan: PlanOption, force: boolean = false) => {
    if (visualizations[plan.id] && !force) return;
    
    setLoadingVis(prev => ({ ...prev, [plan.id]: true }));
    try {
        const imageBase64 = await generateVisualization(plan.layoutDescription, stylePreference);
        setVisualizations(prev => ({ ...prev, [plan.id]: imageBase64 }));
    } catch (e) {
        alert("Failed to generate visualization. Please try again.");
    } finally {
        setLoadingVis(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const downloadImage = (plan: PlanOption) => {
    const imageUri = visualizations[plan.id];
    if (!imageUri) return;
    
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = `${plan.name.replace(/\s+/g, '_')}_Plan.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (plan: PlanOption) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(plan.name, margin, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("ArchGenius AI Design Concept", margin, yPos);
    yPos += 15;

    // Line
    doc.setDrawColor(200);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

    // Concept
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Design Concept", margin, yPos);
    yPos += 7;
    doc.setFontSize(11);
    doc.setTextColor(60);
    const conceptLines = doc.splitTextToSize(plan.concept, contentWidth);
    doc.text(conceptLines, margin, yPos);
    yPos += (conceptLines.length * 5) + 10;

    // Layout Description
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Layout Details", margin, yPos);
    yPos += 7;
    doc.setFontSize(11);
    doc.setTextColor(60);
    const layoutLines = doc.splitTextToSize(plan.layoutDescription, contentWidth);
    doc.text(layoutLines, margin, yPos);
    yPos += (layoutLines.length * 5) + 10;

    // Visualization Image
    const imageUri = visualizations[plan.id];
    if (imageUri) {
        try {
            // Calculate aspect ratio to fit image
            const imgProps = doc.getImageProperties(imageUri);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            
            // Check if we need a new page
            if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }

            doc.addImage(imageUri, 'PNG', margin, yPos, contentWidth, imgHeight);
            yPos += imgHeight + 15;
        } catch (e) {
            console.error("Error adding image to PDF", e);
        }
    }

    // Check for page break for room sizes
    if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = margin;
    }

    // Room Dimensions
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Room Dimensions", margin, yPos);
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(60);

    plan.roomSizes.forEach((room) => {
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
        }
        doc.text(`${room.room}: ${room.area}`, margin, yPos);
        yPos += 6;
    });

    // Save
    doc.save(`${plan.name.replace(/\s+/g, '_')}_Blueprint.pdf`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setActiveTab(plan.id)}
            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-sm border
              ${activeTab === plan.id 
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900 ring-offset-2' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
          >
            {plan.name}
          </button>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Left Panel: Details */}
        <div className="lg:w-7/12 p-8 lg:p-10 flex flex-col space-y-8 overflow-y-auto max-h-[800px]">
          
          <div>
             <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3">
               Total Usage: {activePlan.totalAreaUsed}
             </div>
             <h2 className="text-3xl font-bold text-slate-900 leading-tight">{activePlan.name}</h2>
             <p className="mt-4 text-slate-600 text-lg leading-relaxed">{activePlan.concept}</p>
          </div>

          {/* Layout Description */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
             <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-3">
               <Maximize2 className="w-5 h-5 text-indigo-500" />
               Layout Flow
             </h3>
             <p className="text-slate-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
               {activePlan.layoutDescription}
             </p>
          </div>

           {/* Room Sizes Grid */}
           <div>
            <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-4">
               <Box className="w-5 h-5 text-indigo-500" />
               Room Dimensions
             </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activePlan.roomSizes.map((room, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{room.room}</span>
                  <span className="text-slate-800 font-medium">{room.area}</span>
                </div>
              ))}
            </div>
           </div>

           {/* Unique Aspects */}
           <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <h3 className="flex items-center gap-2 text-indigo-900 font-bold mb-2">
                 <Info className="w-4 h-4" />
                 Unique Feature
              </h3>
              <p className="text-indigo-800 text-sm">{activePlan.uniqueAspects}</p>
           </div>
        </div>

        {/* Right Panel: Analysis & Visuals */}
        <div className="lg:w-5/12 bg-slate-50 p-8 lg:p-10 border-l border-slate-100 flex flex-col space-y-8">
            
            {/* Pros/Cons */}
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Pros
                    </h4>
                    <ul className="space-y-2">
                        {activePlan.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-500" /> Cons
                    </h4>
                    <ul className="space-y-2">
                        {activePlan.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* Visualization Section */}
            <div className="flex-1 flex flex-col">
                 <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" /> 
                    AI Visualization
                 </h4>
                 
                 <div className="w-full aspect-[4/3] bg-white rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center group bg-slate-50 shadow-inner">
                    {visualizations[activePlan.id] ? (
                        <div className="relative w-full h-full group">
                            <img 
                                src={visualizations[activePlan.id]} 
                                alt={`Visualization of ${activePlan.name}`}
                                className="w-full h-full object-cover animate-in fade-in duration-500"
                            />
                            {/* Overlay for regeneration */}
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleVisualize(activePlan, true); }}
                                    className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg"
                                >
                                    <RefreshCw className="w-4 h-4" /> Regenerate Sketch
                                </button>
                            </div>
                        </div>
                    ) : loadingVis[activePlan.id] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                            <div className="relative mb-4">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PenTool className="w-5 h-5 text-indigo-500 opacity-60" />
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-indigo-600 animate-pulse">Drafting Blueprint...</p>
                            <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
                        </div>
                    ) : (
                        <div className="text-center p-6 relative z-0">
                            <p className="text-slate-400 text-sm mb-4">
                                Generate a conceptual blueprint sketch for this layout using Gemini AI.
                            </p>
                            <button 
                                onClick={() => handleVisualize(activePlan)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform"
                            >
                                <ImageIcon className="w-4 h-4" />
                                Visualize Layout
                            </button>
                        </div>
                    )}
                 </div>

                 {/* Download Options */}
                 {visualizations[activePlan.id] && (
                     <div className="flex gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <button
                            onClick={() => downloadImage(activePlan)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                            title="Download Image"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Image</span>
                        </button>
                        <button
                            onClick={() => downloadPDF(activePlan)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                            title="Download PDF Report"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF Report</span>
                        </button>
                     </div>
                 )}
                 {!visualizations[activePlan.id] && (
                     <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => downloadPDF(activePlan)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl text-sm font-medium transition-colors border border-dashed border-slate-200"
                        >
                            <FileText className="w-4 h-4" />
                            Download Project Details (PDF)
                        </button>
                     </div>
                 )}
            </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onReset}
          className="text-slate-500 hover:text-slate-800 font-medium transition-colors flex items-center gap-2"
        >
          ← Start New Project
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;