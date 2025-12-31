import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Suppliers() {
  return (
    <ERPLayout>
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fornecedores</h1>
            <p className="text-slate-400">Gerenciar fornecedores</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">Conteúdo em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
