import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/ogg', 'text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|txt|pdf|docx|doc)$/i)) {
      toast.error("Formato no válido. Use MP3, WAV, M4A, OGG, TXT, PDF o DOCX");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("Archivo muy grande. Máximo 25MB");
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
      toast.success("Archivo cargado correctamente");
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${isDragging ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border hover:border-primary'}
        ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        accept=".mp3,.wav,.m4a,.ogg,.txt,.pdf,.doc,.docx,audio/*,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-foreground">
            Arrastra tu archivo aquí
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            o haz clic para seleccionar
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Audio: MP3, WAV, M4A, OGG • Documentos: TXT, PDF, DOCX • Máximo 25MB
        </p>
      </div>
    </div>
  );
};
