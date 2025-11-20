import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { AudioRecorder } from "./AudioRecorder";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TranscriptionPanelProps {
  transcription: string;
  setTranscription: (text: string) => void;
  onTranscriptionComplete: (text: string) => void;
}

export const TranscriptionPanel = ({ 
  transcription, 
  setTranscription,
  onTranscriptionComplete 
}: TranscriptionPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const transcribeAudio = async (audioData: Blob | File) => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Convert audio to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioData);
      });
      
      setProgress(30);
      
      // Call ElevenLabs API
      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': 'sk_49bd5f8b81312795ed3934dc63d37165097629a3e48d2c65',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          model_id: 'eleven_multilingual_v2'
        })
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error(`Error en transcripción: ${response.statusText}`);
      }

      const data = await response.json();
      const transcribedText = data.text || '';
      
      setProgress(100);
      setTranscription(transcribedText);
      onTranscriptionComplete(transcribedText);
      
      toast.success("Transcripción completada");
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error("Error en la transcripción");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleClear = () => {
    setTranscription('');
    setProgress(0);
    toast.success("Transcripción limpiada");
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Transcripción</h2>
        
        <FileUpload 
          onFileSelect={transcribeAudio}
          isProcessing={isProcessing}
        />
        
        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              o
            </span>
          </div>
        </div>
        
        <AudioRecorder 
          onRecordingComplete={transcribeAudio}
          isProcessing={isProcessing}
        />
      </div>
      
      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Procesando audio...</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Texto transcrito
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!transcription || isProcessing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
        
        <Textarea
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder="El texto transcrito aparecerá aquí..."
          className="flex-1 min-h-[300px] font-mono text-sm resize-none"
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Transcribiendo audio...
        </div>
      )}
    </div>
  );
};
