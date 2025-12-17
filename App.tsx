import React, { useState } from 'react';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';
import { generateFloorPlans } from './services/geminiService';
import { UserRequirements, PlanOption, GenerationResponse } from './types';
import { PenTool, LayoutTemplate } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStyle, setUserStyle] = useState<string>('');

  const handleFormSubmit = async (data: UserRequirements) => {
    setIsLoading(true);
    setUserStyle(data.style);
    try {
      const response: GenerationResponse = await generateFloorPlans(data);
      if (response && response.options) {
        setPlans(response.options);
        setStep('results');
      }
    } catch (error: any) {
      console.error("Failed to generate plans", error);
      // Use the specific error message thrown by the service
      const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlans([]);
    setStep('input');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
               <LayoutTemplate className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              ArchGenius <span className="text-blue-600 font-light">AI</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className={step === 'input' ? 'text-blue-600' : ''}>1. Specify</span>
            <span className="text-slate-300">/</span>
            <span className={step === 'results' ? 'text-blue-600' : ''}>2. Design</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center space-y-8">
          
          {step === 'input' && (
            <div className="w-full text-center space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Design Your Dream Home in Seconds
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Powered by Gemini AI, ArchGenius creates professional architectural concepts tailored to your lifestyle, plot, and preferences.
              </p>
            </div>
          )}

          {step === 'input' ? (
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          ) : (
            <PlanDisplay plans={plans} onReset={handleReset} stylePreference={userStyle} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} ArchGenius AI. Conceptual designs for inspiration purposes. All Rights Reserved. Created By Samar Jeet Jamwal.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
