import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Copy, Download, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SummaryPanelProps {
  transcription: string;
  triggerSummary: boolean;
}

interface SummaryData {
  context: string;
  keyPoints: string[];
  commitments: string[];
  nextSteps: string[];
  concerns: string[];
}

export const SummaryPanel = ({ transcription, triggerSummary }: SummaryPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    if (triggerSummary && transcription && !isProcessing) {
      generateSummary();
    }
  }, [triggerSummary, transcription]);

  const generateSummary = async () => {
    if (!transcription) {
      toast.error("No hay transcripción para analizar");
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBtenpJKzQfkgLLhVGIuTIy4NeFnC4odoY',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `# System Prompt para Análisis de Transcripciones de Reuniones IndiGO - Customer Experience

Eres un asistente especializado en analizar transcripciones de reuniones entre el equipo de Customer Experience de IndiGO y sus clientes. Tu objetivo es extraer insights accionables, identificar patrones y proporcionar un análisis estructurado que facilite la toma de decisiones.

## CONTEXTO DE LAS REUNIONES
Las reuniones pueden abarcar múltiples áreas:
- **Comerciales**: Negociaciones, propuestas de valor, pricing, contratos
- **Soporte técnico**: Resolución de problemas, escalaciones, troubleshooting
- **Consultivas**: Recomendaciones estratégicas, optimización de procesos
- **Seguimiento**: Status updates, cumplimiento de acuerdos, métricas de éxito
- **Relacionamiento**: Construcción de confianza, gestión de expectativas

## INSTRUCCIONES DE PROCESAMIENTO
Analiza la transcripción y extrae:
1. Identificación de participantes y roles
2. Clasificación del tipo de reunión
3. Necesidades y pain points del cliente
4. Sentimiento y satisfacción
5. Compromisos y acuerdos
6. Objeciones y preocupaciones
7. Oportunidades comerciales
8. Riesgos y red flags

## FORMATO DE OUTPUT
Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "context": "Resumen ejecutivo de la reunión (3-5 líneas)",
  "keyPoints": ["insight principal 1", "insight principal 2", "insight principal 3", "insight principal 4", "insight principal 5"],
  "commitments": ["acción | responsable | fecha", "acción 2 | responsable | fecha"],
  "nextSteps": ["próximo paso recomendado 1", "próximo paso 2", "próximo paso 3"],
  "concerns": ["riesgo identificado 1", "preocupación 2"]
}

## PRINCIPIOS DE ANÁLISIS
- Objetividad: Separa hechos de interpretaciones
- Accionabilidad: Prioriza insights que permitan tomar decisiones
- Precisión: No inventes información que no esté en la transcripción
- Urgencia: Identifica claramente qué requiere atención inmediata

Transcripción:
${transcription}

Responde SOLO con el JSON, sin texto adicional.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Error en análisis: ${errorMessage}. Verifica que tu API key de Gemini sea válida.`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedSummary = JSON.parse(jsonMatch[0]);
        setSummary(parsedSummary);
        toast.success("Resumen generado correctamente");
      } else {
        throw new Error("No se pudo extraer el resumen estructurado");
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Error al generar el resumen";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    
    const text = `
RESUMEN EJECUTIVO - INDIGO

CONTEXTO:
${summary.context}

PUNTOS CLAVE:
${summary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

COMPROMISOS Y ACCIONES:
${summary.commitments.map((commitment, i) => `${i + 1}. ${commitment}`).join('\n')}

PRÓXIMOS PASOS:
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

PREOCUPACIONES U OBJECIONES:
${summary.concerns.map((concern, i) => `${i + 1}. ${concern}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success("Resumen copiado al portapapeles");
  };

  const handleDownload = () => {
    if (!summary) return;
    
    const text = `
RESUMEN EJECUTIVO - INDIGO
Generado: ${new Date().toLocaleString('es-ES')}

═══════════════════════════════════════

CONTEXTO:
${summary.context}

═══════════════════════════════════════

PUNTOS CLAVE:
${summary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

═══════════════════════════════════════

COMPROMISOS Y ACCIONES:
${summary.commitments.map((commitment, i) => `${i + 1}. ${commitment}`).join('\n')}

═══════════════════════════════════════

PRÓXIMOS PASOS:
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

═══════════════════════════════════════

PREOCUPACIONES U OBJECIONES:
${summary.concerns.map((concern, i) => `${i + 1}. ${concern}`).join('\n')}
    `.trim();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-indigo-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Resumen descargado");
  };

  const handleEmail = () => {
    if (!summary) return;
    
    const subject = encodeURIComponent('Resumen Ejecutivo - Reunión Comercial Indigo');
    const body = encodeURIComponent(`
RESUMEN EJECUTIVO - INDIGO

CONTEXTO:
${summary.context}

PUNTOS CLAVE:
${summary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

COMPROMISOS Y ACCIONES:
${summary.commitments.map((commitment, i) => `${i + 1}. ${commitment}`).join('\n')}

PRÓXIMOS PASOS:
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

PREOCUPACIONES U OBJECIONES:
${summary.concerns.map((concern, i) => `${i + 1}. ${concern}`).join('\n')}
    `.trim());
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Resumen Inteligente</h2>
        
        {summary && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Completado</span>
          </div>
        )}
      </div>
      
      {!transcription && !isProcessing && (
        <Card className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              El resumen se generará automáticamente
            </p>
            <p className="text-sm text-muted-foreground">
              Primero completa la transcripción en el panel izquierdo
            </p>
          </div>
        </Card>
      )}
      
      {isProcessing && (
        <Card className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div>
              <p className="text-lg font-medium">Analizando transcripción...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generando resumen inteligente con IA
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {summary && !isProcessing && (
        <>
          <div className="flex-1 overflow-y-auto space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-primary">Contexto</h3>
              <p className="text-sm text-foreground leading-relaxed">{summary.context}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-primary">Puntos Clave</h3>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground">
                    <span className="text-accent font-medium">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-primary">Compromisos y Acciones</h3>
              <ul className="space-y-2">
                {summary.commitments.map((commitment, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground">
                    <span className="text-brand-pink font-medium">{i + 1}.</span>
                    <span>{commitment}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-primary">Próximos Pasos</h3>
              <ul className="space-y-2">
                {summary.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground">
                    <span className="text-secondary font-medium">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            {summary.concerns.length > 0 && (
              <Card className="p-6 border-destructive/20">
                <h3 className="font-semibold text-lg mb-3 text-destructive">
                  Preocupaciones u Objeciones
                </h3>
                <ul className="space-y-2">
                  {summary.concerns.map((concern, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground">
                      <span className="text-destructive font-medium">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button onClick={handleEmail} variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
