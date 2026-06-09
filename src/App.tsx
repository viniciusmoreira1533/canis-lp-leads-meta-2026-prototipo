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

const WEBHOOK_URL = 'https://n8nwebhook.server2.wolframe.app/webhook/4d138bce-e3ea-44cf-bdc8-246b8d8344b9';
const WHATSAPP_NUMBER = '5511999999999'; // TODO: Preencher com o número do WhatsApp da Alpha House/CanisLab

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'web': 'Sistema Web/SaaS',
  'mobile': 'Aplicativo Mobile',
  'ai': 'Solução com Inteligência Artificial',
  'outro': 'Outro'
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  'ideia': 'apenas uma ideia',
  'iniciado': 'iniciado mas incompleto',
  'refazer': 'já existente mas precisando ser refeito'
};

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
    setTimeout(() => setCurrentStep(nextStep), 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppLink = () => {
    const produto = PROJECT_TYPE_LABELS[formData.projectType] || 'tecnologia';
    const estado = PROJECT_STATUS_LABELS[formData.projectStatus] || 'em planejamento';
    const text = `Oi, vi o anuncio na meta sobre os prototipos, preciso de um prototipo de ${produto}, atualmente meu projeto esta ${estado}. Gostaria de conversar.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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

      if (formData.budget === 'menor') {
        setCurrentStep('unqualified');
      } else {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead');
        }
        setCurrentStep('success');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      if (formData.budget === 'menor') {
        setCurrentStep('unqualified');
      } else {
        setCurrentStep('success');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = ['intro', 'step1', 'step2', 'step3', 'step4', 'success', 'unqualified'];
  const currentIndex = stepsList.indexOf(currentStep);
  const isFormStep = currentStep === 'step1' || currentStep === 'step2' || currentStep === 'step3' || currentStep === 'step4';
  const progressPercentage = currentStep === 'intro' ? 0 :
    currentStep === 'success' || currentStep === 'unqualified' ? 100 :
    (currentIndex / 4) * 100;

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500 w-full max-w-2xl mx-auto mt-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight px-4">
        Veja seu projeto <span className="text-primary">PRONTO</span> antes de começar a{' '}
        <span className="text-primary">DESENVOLVER</span>
      </h1>

      <div className="w-full glass-card rounded-2xl p-6 md:p-8 text-left text-foreground/90 space-y-4">
        <p className="font-medium text-lg border-b border-border/50 pb-4">
          Por um investimento de R$ 1.800, o pacote de Protótipo da{' '}
          <span className="text-primary font-semibold">Alpha House</span> entrega:
        </p>
        <ul className="space-y-3 pt-2">
          {[
            'Mapeamento da Jornada do Usuário e Arquitetura Técnica.',
            'Protótipo Visual de Alta Fidelidade.',
            'Telas interativas prontas para teste.',
            'Pesquisa de mercado.'
          ].map((item, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mr-3 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setCurrentStep('step1')}
        className="btn-cta w-full md:w-auto glow-primary relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 ease-in-out bg-primary rounded-xl hover:brightness-110 hover:scale-[1.03] active:scale-95 focus:outline-none group"
      >
        <span className="text-lg">Começar Agora</span>
        <ArrowRight className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Qual o seu tipo de projeto que deseja desenvolver?</h2>
      <div className="space-y-3">
        {Object.entries(PROJECT_TYPE_LABELS).map(([id, label]) => (
          <button
            key={id}
            onClick={() => handleSelect('projectType', id, 'step2')}
            className={`w-full flex items-center justify-between p-5 rounded-2xl text-left cursor-pointer ${
              formData.projectType === id ? 'option-card-active' : 'option-card'
            }`}
          >
            <span className="text-lg font-medium">{label}</span>
            <ChevronRight className={`w-5 h-5 shrink-0 transition-transform duration-200 ${formData.projectType === id ? 'text-primary translate-x-1' : 'text-primary/40'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Qual é o status atual do seu projeto?</h2>
      <div className="space-y-3">
        {[
          { id: 'ideia', label: 'Apenas uma ideia' },
          { id: 'iniciado', label: 'Iniciado mas incompleto' },
          { id: 'refazer', label: 'Já existe mas precisa ser refeito' },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect('projectStatus', option.id, 'step3')}
            className={`w-full flex items-center justify-between p-5 rounded-2xl text-left cursor-pointer ${
              formData.projectStatus === option.id ? 'option-card-active' : 'option-card'
            }`}
          >
            <span className="text-lg font-medium">{option.label}</span>
            <ChevronRight className={`w-5 h-5 shrink-0 transition-transform duration-200 ${formData.projectStatus === option.id ? 'text-primary translate-x-1' : 'text-primary/40'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        O investimento para um MVP parte de R$ 1.800. Como você planeja investir?
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
            className={`w-full flex items-center justify-between p-5 rounded-2xl text-left cursor-pointer ${
              formData.budget === option.id ? 'option-card-active' : 'option-card'
            }`}
          >
            <span className="text-lg font-medium">{option.label}</span>
            <ChevronRight className={`w-5 h-5 shrink-0 transition-transform duration-200 ${formData.budget === option.id ? 'text-primary translate-x-1' : 'text-primary/40'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Quase lá!</h2>
      <p className="text-muted-foreground text-center mb-8 text-lg">Para onde enviamos os detalhes?</p>

      <form onSubmit={handleSubmit} className="space-y-5 glass-card p-8 rounded-2xl border-primary/20">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">Nome completo</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="input-styled w-full px-4 py-4 rounded-xl text-lg"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">E-mail de trabalho</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="input-styled w-full px-4 py-4 rounded-xl text-lg"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp</label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="input-styled w-full px-4 py-4 rounded-xl text-lg"
            placeholder="(11) 99999-9999"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-cta w-full flex items-center justify-center px-8 py-5 mt-4 font-bold text-lg text-white transition-all duration-300 ease-in-out bg-primary rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed glow-primary"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <span>Ver Proposta</span>
              <CheckCircle2 className="w-6 h-6 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in fade-in duration-500 mt-10 relative">
      {/* Confetti */}
      <div className="confetti-piece confetti-1" />
      <div className="confetti-piece confetti-2" />
      <div className="confetti-piece confetti-3" />
      <div className="confetti-piece confetti-4" />
      <div className="confetti-piece confetti-5" />

      <div className="success-icon-animate w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/30 glow-primary">
        <CheckCircle2 className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">Recebemos seus dados!</h2>
      <p className="text-xl text-muted-foreground max-w-md">
        Entraremos em contato em até 24h. Se preferir, pode me chamar direto no WhatsApp.
      </p>
      <a
        href={generateWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta inline-flex items-center justify-center px-10 py-5 font-bold text-lg text-white transition-all duration-300 bg-[#25D366] rounded-xl hover:bg-[#128C7E] hover:scale-105 shadow-[0_0_30px_rgba(37,211,102,0.3)] mt-4"
      >
        Falar no WhatsApp
      </a>
    </div>
  );

  const renderUnqualified = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in fade-in duration-500 mt-10">
      <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mb-4">
        <XCircle className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">Agradecemos o interesse!</h2>
      <p className="text-lg text-muted-foreground max-w-md">
        Infelizmente no momento nossos pacotes de MVP partem de R$ 1.800.
      </p>
      <a
        href="https://instagram.com/alphahouse"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-10 py-5 mt-6 font-bold text-lg text-foreground transition-all duration-300 glass-card rounded-xl hover:scale-105"
      >
        Acompanhar no Instagram
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30 tech-grid relative overflow-x-hidden">
      {/* Decorative gradients — GPU-animated blobs */}
      <div className="blob-1 fixed top-[-20%] left-[-10%] w-[65%] h-[65%] rounded-full bg-primary/15 blur-[180px] pointer-events-none" />
      <div className="blob-2 fixed bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#2e7d89]/12 blur-[160px] pointer-events-none" />

      {/* Scanline sweep effect */}
      <div className="bg-scanline" />

      {/* Logo Centralizado no Topo */}
      <div className="w-full flex flex-col items-center pt-10 pb-4 relative z-10 space-y-4">
        <img
          src="/canis_logo.webp"
          alt="Canis Logo"
          className="h-10 object-contain drop-shadow-[0_0_20px_rgba(46,125,137,0.4)]"
        />
        {/* Separador decorativo */}
        <div className="logo-divider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 block" />
        </div>

        {/* Barra de progresso — apenas nos steps 1-4 */}
        {isFormStep && (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs px-4">
            <div className="progress-bar-track w-full h-1.5">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Passo {currentIndex} de 4
            </span>
          </div>
        )}
      </div>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 pt-2 pb-20 w-full relative z-10">
        <div className="w-full max-w-2xl">
          {currentStep === 'intro' && renderIntro()}
          {currentStep === 'step1' && renderStep1()}
          {currentStep === 'step2' && renderStep2()}
          {currentStep === 'step3' && renderStep3()}
          {currentStep === 'step4' && renderStep4()}
          {currentStep === 'success' && renderSuccess()}
          {currentStep === 'unqualified' && renderUnqualified()}
        </div>
      </main>
    </div>
  );
}

export default App;
