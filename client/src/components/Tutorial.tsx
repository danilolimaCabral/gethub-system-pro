import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const TUTORIAL_KEY = "erp-tutorial-completed";

export function Tutorial() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Verifica se o tutorial já foi completado
    const tutorialCompleted = localStorage.getItem(TUTORIAL_KEY);
    
    // Se não foi completado, aguarda 1 segundo e inicia
    if (!tutorialCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">Bem-vindo ao ERP Financeiro! 🎉</h2>
          <p>
            Este é um tour rápido para você conhecer as principais funcionalidades do sistema.
            Vamos começar?
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Dashboard CEO</h3>
          <p>
            Aqui você tem uma visão executiva completa do seu negócio com KPIs,
            gráficos de evolução de caixa, recebíveis vs pagáveis e análise por categorias.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="cashflow"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Caixa Real</h3>
          <p>
            Controle todas as movimentações financeiras diárias. Registre entradas e saídas,
            acompanhe o saldo em tempo real e calcule burn rate e runway automaticamente.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="receivables"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Recebíveis</h3>
          <p>
            Gerencie valores a receber, acompanhe status (Previsto, Recebido, Atrasado),
            calcule dias em atraso automaticamente e visualize projeções D+7, D+15 e D+30.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="payables"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Pagáveis</h3>
          <p>
            Controle contas a pagar, classifique custos como Fixo ou Variável,
            receba alertas de vencimento e acompanhe status (Aberto, Pago, Vencido).
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="cadastros"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Cadastros</h3>
          <p>
            Gerencie todos os cadastros básicos: Empresas, Produtos, Categorias,
            Fornecedores, Clientes e Marketplaces. Todos com CRUD completo.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="import"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Importar Planilha</h3>
          <p>
            Importe dados em massa através de planilhas Excel. O sistema valida,
            faz preview dos dados e permite confirmar antes de importar.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="user-menu"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">Menu do Usuário</h3>
          <p>
            Acesse suas configurações, altere senha, dados pessoais ou faça logout.
            Você pode reexibir este tutorial a qualquer momento nas configurações.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">Pronto para começar! ✨</h2>
          <p>
            Agora você conhece as principais funcionalidades do sistema.
            Explore à vontade e aproveite o ERP Financeiro!
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Marca o tutorial como completado
      localStorage.setItem(TUTORIAL_KEY, "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#3b82f6",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: "6px",
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#6b7280",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "#6b7280",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
}

// Função para resetar o tutorial (útil para configurações)
export function resetTutorial() {
  localStorage.removeItem(TUTORIAL_KEY);
  window.location.reload();
}
