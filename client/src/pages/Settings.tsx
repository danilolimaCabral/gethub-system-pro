import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <ERPLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-slate-400">Parâmetros do sistema</p>
        </div>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Parâmetros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">Conteúdo em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
