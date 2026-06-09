import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, XCircle, Loader2 } from 'lucide-react';

type StepType = 'intro' | 'step1' | 'step2' | 'step3' | 'step4' | 'success' | 'unqualified';

interface FormData {
  projectType: string;
  projectStatus: string;
  budget: string;
  name: string;
  email: string;
  whatsapp: string;
}

const WEBHOOK_URL = ''; // TODO: Preencher com a URL do Webhook
const WHATSAPP_LINK = 'https://wa.me/5511999999999'; // TODO: Preencher com o link do WhatsApp
const INSTAGRAM_LINK = 'https://instagram.com/canislab'; // TODO: Preencher

function App() {
  const [currentStep, setCurrentStep] = useState<StepType>('intro');
  const [formData, setFormData] = useState<FormData>({
    projectType: '',
    projectStatus: '',
    budget: '',
    name: '',
    email: '',
    whatsapp: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (field: keyof FormData, value: string, nextStep: StepType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Pequeno delay para a animação de clique
    setTimeout(() => setCurrentStep(nextStep), 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Enviar para o Webhook independente da qualificação
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            submittedAt: new Date().toISOString(),
            isQualified: formData.budget !== 'menor'
          }),
        });
      }

      // 2. Lógica de Qualificação
      if (formData.budget === 'menor') {
        setCurrentStep('unqualified');
      } else {
        // Disparar Meta Pixel apenas para Leads Qualificados
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead');
        }
        setCurrentStep('success');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      // Fallback em caso de erro no webhook, seguimos o fluxo
      if (formData.budget === 'menor') {
        setCurrentStep('unqualified');
      } else {
        setCurrentStep('success');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções para renderizar cada tela
  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
        Veja seu projeto <span className="text-primary">PRONTO</span> antes de começar a <span className="text-primary">DESENVOLVER</span>
      </h1>
      <p className="text-lg md:text-xl text-textMuted max-w-2xl leading-relaxed">
        Por um investimento a partir de R$ 1.800, o pacote de Protótipo entrega: Mapeamento da Jornada, Arquitetura Técnica, Protótipo Visual de Alta Fidelidade, Telas interativas prontas para teste e Pesquisa de mercado.
      </p>
      <button
        onClick={() => setCurrentStep('step1')}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 ease-in-out bg-primary rounded-full hover:bg-primaryHover hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        <span>Continuar</span>
        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">Qual o seu tipo de projeto que deseja desenvolver?</h2>
      <div className="space-y-3">
        {[
          { id: 'web', label: 'Sistema Web/SaaS' },
          { id: 'mobile', label: 'Aplicativo Mobile' },
          { id: 'ai', label: 'Solução com Inteligência Artificial' },
          { id: 'outro', label: 'Outro' },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect('projectType', option.id, 'step2')}
            className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 text-left ${
              formData.projectType === option.id
                ? 'border-primary bg-primary/10 text-white'
                : 'border-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-textMuted hover:text-textMain'
            }`}
          >
            <span className="text-lg">{option.label}</span>
            <ChevronRight className={`w-5 h-5 ${formData.projectType === option.id ? 'text-primary' : 'text-transparent'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">Qual é o status atual do seu projeto?</h2>
      <div className="space-y-3">
        {[
          { id: 'ideia', label: 'Apenas uma ideia' },
          { id: 'iniciado', label: 'Iniciado mas incompleto' },
          { id: 'refazer', label: 'Já existe mas precisa ser refeito' },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect('projectStatus', option.id, 'step3')}
            className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 text-left ${
              formData.projectStatus === option.id
                ? 'border-primary bg-primary/10 text-white'
                : 'border-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-textMuted hover:text-textMain'
            }`}
          >
            <span className="text-lg">{option.label}</span>
            <ChevronRight className={`w-5 h-5 ${formData.projectStatus === option.id ? 'text-primary' : 'text-transparent'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">
        O investimento para um MVP no CanisLab parte de R$ 1.800. Como você planeja investir?
      </h2>
      <div className="space-y-3">
        {[
          { id: 'agora', label: 'Tenho esse orçamento disponível e quero começar agora' },
          { id: 'prazos', label: 'Posso investir esse valor mas preciso entender melhor os prazos' },
          { id: 'menor', label: 'Meu orçamento é menor no momento' },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect('budget', option.id, 'step4')}
            className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 text-left ${
              formData.budget === option.id
                ? 'border-primary bg-primary/10 text-white'
                : 'border-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-textMuted hover:text-textMain'
            }`}
          >
            <span className="text-lg">{option.label}</span>
            <ChevronRight className={`w-5 h-5 ${formData.budget === option.id ? 'text-primary' : 'text-transparent'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2 text-center">Quase lá!</h2>
      <p className="text-textMuted text-center mb-8">Para onde enviamos a proposta?</p>
      
      <form onSubmit={handleSubmit} className="space-y-5 glass-panel p-8 rounded-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textMuted mb-1">Nome completo</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-textMuted mb-1">E-mail de trabalho</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-textMuted mb-1">WhatsApp</label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white"
            placeholder="(11) 99999-9999"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-8 py-4 mt-6 font-semibold text-white transition-all duration-300 ease-in-out bg-primary rounded-xl hover:bg-primaryHover disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <span>Finalizar e Ver Proposta</span>
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in fade-in duration-500">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white">Parabéns!</h2>
      <p className="text-xl text-textMuted max-w-md">
        Entraremos em contato em até 24h com a sua proposta estruturada.
      </p>
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-green-600 rounded-full hover:bg-green-700 hover:scale-105"
      >
        Falar no WhatsApp
      </a>
    </div>
  );

  const renderUnqualified = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in fade-in duration-500">
      <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4">
        <XCircle className="w-10 h-10 text-textMuted" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white">Agradecemos o interesse!</h2>
      <p className="text-lg text-textMuted max-w-md">
        Infelizmente no momento nossos pacotes de MVP partem de R$ 1.800.
      </p>
      <a
        href={INSTAGRAM_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-8 py-4 mt-4 font-semibold text-white transition-all duration-300 bg-surface border border-border rounded-full hover:bg-border hover:scale-105"
      >
        Acompanhar no Instagram
      </a>
    </div>
  );

  // Progresso superior
  const stepsList = ['intro', 'step1', 'step2', 'step3', 'step4', 'success', 'unqualified'];
  const currentIndex = stepsList.indexOf(currentStep);
  const progressPercentage = currentStep === 'intro' ? 0 : 
                            currentStep === 'success' || currentStep === 'unqualified' ? 100 : 
                            ((currentIndex) / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      {/* Header com Barra de Progresso */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-surface">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm">C</span>
            CanisLab
          </div>
          {currentStep !== 'intro' && currentStep !== 'success' && currentStep !== 'unqualified' && (
            <span className="text-sm font-medium text-textMuted">
              Passo {currentIndex} de 4
            </span>
          )}
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 flex items-center justify-center p-6 mt-16 pb-20">
        <div className="w-full max-w-4xl">
          {currentStep === 'intro' && renderIntro()}
          {currentStep === 'step1' && renderStep1()}
          {currentStep === 'step2' && renderStep2()}
          {currentStep === 'step3' && renderStep3()}
          {currentStep === 'step4' && renderStep4()}
          {currentStep === 'success' && renderSuccess()}
          {currentStep === 'unqualified' && renderUnqualified()}
        </div>
      </main>

      {/* Decorative gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
    </div>
  );
}

export default App;
