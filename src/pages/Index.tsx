import { useState } from "react";
import { Header } from "@/components/Header";
import { TranscriptionPanel } from "@/components/TranscriptionPanel";
import { SummaryPanel } from "@/components/SummaryPanel";

const Index = () => {
  const [transcription, setTranscription] = useState("");
  const [triggerSummary, setTriggerSummary] = useState(false);

  const handleTranscriptionComplete = (text: string) => {
    setTriggerSummary(true);
    setTimeout(() => setTriggerSummary(false), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm overflow-y-auto">
              <TranscriptionPanel 
                transcription={transcription}
                setTranscription={setTranscription}
                onTranscriptionComplete={handleTranscriptionComplete}
              />
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm overflow-y-auto">
              <SummaryPanel 
                transcription={transcription}
                triggerSummary={triggerSummary}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
