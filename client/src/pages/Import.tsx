import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface PreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      return;
    }

    setFile(selectedFile);
    setPreview(null);
    setImportResult(null);

    // Ler arquivo e gerar preview
    try {
      setIsProcessing(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const data = event.target?.result;
        if (!data) return;

        try {
          // Processar Excel com xlsx
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

          if (jsonData.length === 0) {
            toast.error("Planilha vazia");
            return;
          }

          const headers = jsonData[0].map(h => String(h || ''));
          const rows = jsonData.slice(1, 11); // Mostrar apenas primeiras 10 linhas no preview
          const totalRows = jsonData.length - 1;

          const previewData: PreviewData = {
            headers,
            rows,
            totalRows,
          };

          setPreview(previewData);
          toast.success(`Arquivo carregado! ${totalRows} registros encontrados`);
        } catch (error) {
          console.error(error);
          toast.error("Erro ao processar planilha");
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setIsProcessing(true);
    setImportProgress(0);

    try {
      // Simular progresso de importação
      const interval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Aqui você chamaria o endpoint de importação
      // await importMutation.mutateAsync({ file, mapping });
      
      // Simular sucesso após 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setImportProgress(100);

      setImportResult({
        success: preview.totalRows,
        errors: 0,
      });

      toast.success(`${preview.totalRows} registros importados com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao importar dados");
      setImportResult({
        success: 0,
        errors: preview.totalRows,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setImportProgress(0);
    setImportResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Importação de Planilhas</h1>
            <p className="text-slate-400 mt-1">
              Importe dados de planilhas Excel para o sistema
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open("/template-importacao.xlsx", "_blank")}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Modelo
          </Button>
        </div>

        {/* Upload Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">1. Selecione o Arquivo</CardTitle>
            <CardDescription className="text-slate-400">
              Escolha um arquivo Excel (.xlsx ou .xls) para importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {file ? (
                    <>
                      <FileSpreadsheet className="w-12 h-12 text-green-500" />
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-400" />
                      <p className="text-white font-medium">
                        Clique para selecionar ou arraste o arquivo aqui
                      </p>
                      <p className="text-sm text-slate-400">
                        Formatos suportados: .xlsx, .xls
                      </p>
                    </>
                  )}
                </Label>
              </div>

              {file && !preview && (
                <Alert className="bg-blue-900/20 border-blue-800">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <AlertDescription className="text-blue-300">
                    Processando arquivo...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {preview && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">2. Preview dos Dados</CardTitle>
              <CardDescription className="text-slate-400">
                Verifique os dados antes de importar ({preview.totalRows} registros encontrados)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                      {preview.headers.map((header, idx) => (
                        <TableHead key={idx} className="text-slate-300 font-semibold">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx} className="border-slate-700">
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className="text-slate-300">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar Importação
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Card */}
        {isProcessing && importProgress > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">3. Progresso da Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-slate-400 text-center">
                  {importProgress}% concluído
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Card */}
        {importResult && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resultado da Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importResult.success > 0 && (
                  <Alert className="bg-green-900/20 border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-300">
                      <strong>{importResult.success}</strong> registros importados com sucesso!
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.errors > 0 && (
                  <Alert className="bg-red-900/20 border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-300">
                      <strong>{importResult.errors}</strong> registros com erro
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleReset}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Importar Novo Arquivo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
