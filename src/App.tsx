import { useState, type ChangeEvent, type FocusEvent, type FormEvent, type KeyboardEvent } from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import {
  WEBHOOK_URL,
  WHATSAPP_NUMBER,
  PRICE,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_OPTIONS,
  BUDGET_OPTIONS,
  STEP_DOT_LABELS,
} from './config';

type StepType = 'intro' | 'step1' | 'step2' | 'step3' | 'step4' | 'success' | 'unqualified';

interface FormData {
  projectType: string;
  projectStatus: string;
  budget: string;
  name: string;
  email: string;
  whatsapp: string;
}

const WHATSAPP_MESSAGE_QUALIFIED = (
  nome: string,
  produto: string,
  estado: string,
) =>
  `Oi, meu nome é ${nome}. Vi o anúncio na Meta sobre os protótipos, preciso de um protótipo de ${produto}, atualmente meu projeto está ${estado}. Gostaria de conversar.`;

const WHATSAPP_MESSAGE_UNQUALIFIED = (
  nome: string,
  produto: string,
  estado: string,
) =>
  `Oi, meu nome é ${nome}. Vi o anúncio sobre os protótipos. Meu projeto é um ${produto} e está ${estado}. Meu orçamento é menor no momento, mas gostaria de conversar sobre alternativas.`;

const formatWhatsApp = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const STEP_ORDER: StepType[] = ['intro', 'step1', 'step2', 'step3', 'step4'];

function App() {
  const [currentStep, setCurrentStep] = useState<StepType>('intro');
  const [stepHistory, setStepHistory] = useState<StepType[]>(['intro']);
  const [formData, setFormData] = useState<FormData>({
    projectType: '',
    projectStatus: '',
    budget: '',
    name: '',
    email: '',
    whatsapp: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const goToStep = (step: StepType) => {
    setStepHistory((prev) => [...prev, step]);
    setCurrentStep(step);
  };

  const goBack = () => {
    if (stepHistory.length <= 1) return;
    const newHistory = [...stepHistory];
    newHistory.pop();
    setStepHistory(newHistory);
    setCurrentStep(newHistory[newHistory.length - 1]);
  };

  const handleSelect = (field: keyof FormData, value: string, nextStep: StepType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => goToStep(nextStep), 300);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'whatsapp' ? formatWhatsApp(value) : value,
    }));
  };

  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouchedFields((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const getInputClassName = (name: string, value: string) => {
    const base = 'input-styled w-full px-4 py-4 rounded-xl text-lg';
    if (!touchedFields[name]) return base;
    if (value.trim()) return `${base} input-valid`;
    return `${base} input-invalid`;
  };

  const generateWhatsAppLink = (isQualified: boolean) => {
    const produto = PROJECT_TYPE_LABELS[formData.projectType] || 'tecnologia';
    const estado = PROJECT_STATUS_LABELS[formData.projectStatus] || 'em planejamento';
    const text = isQualified
      ? WHATSAPP_MESSAGE_QUALIFIED(formData.name, produto, estado)
      : WHATSAPP_MESSAGE_UNQUALIFIED(formData.name, produto, estado);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();

    const allTouched: Record<string, boolean> = {};
    (['name', 'email', 'whatsapp'] as const).forEach((f) => {
      allTouched[f] = true;
    });
    setTouchedFields((prev) => ({ ...prev, ...allTouched }));

    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      return;
    }

    goToStep('step2');
  };

  const submitLead = async (budgetId: string) => {
    setFormData((prev) => ({ ...prev, budget: budgetId }));
    setIsSubmitting(true);

    try {
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            budget: budgetId,
            whatsapp: formData.whatsapp.replace(/\D/g, ''),
            submittedAt: new Date().toISOString(),
            isQualified: budgetId !== 'menor',
            source: 'lp-prototipos',
          }),
        });
      }

      if (budgetId === 'menor') {
        setCurrentStep('unqualified');
      } else {
        if (window.fbq) {
          window.fbq('track', 'Lead');
        }
        setCurrentStep('success');
      }
    } catch {
      setCurrentStep(budgetId === 'menor' ? 'unqualified' : 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetButtonProps = (value: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-pressed': formData.budget === value,
    onClick: () => submitLead(value),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        submitLead(value);
      }
    },
  });

  const optionButtonProps = (
    field: keyof FormData,
    value: string,
    nextStep: StepType,
  ) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-pressed': formData[field] === value,
    onClick: () => handleSelect(field, value, nextStep),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(field, value, nextStep);
      }
    },
  });

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFormStep =
    currentStep === 'step1' ||
    currentStep === 'step2' ||
    currentStep === 'step3' ||
    currentStep === 'step4';
  const showBack = currentStep === 'step2' || currentStep === 'step3' || currentStep === 'step4';

  const progressPercentage =
    currentStep === 'intro'
      ? 0
      : currentStep === 'success' || currentStep === 'unqualified'
        ? 100
        : (currentIndex / 4) * 100;

  const stepDotStates = [
    { field: 'name' as keyof FormData, idx: 1 },
    { field: 'projectType' as keyof FormData, idx: 2 },
    { field: 'projectStatus' as keyof FormData, idx: 3 },
    { field: 'budget' as keyof FormData, idx: 4 },
  ];

  const renderStepDots = () => (
    <div className="flex flex-col items-center gap-1 w-full max-w-md px-4">
      <div className="step-dots-row">
        {stepDotStates.map((dot, i) => {
          const isComplete = !!formData[dot.field];
          const isCurrent = currentIndex === dot.idx;
          const isGold = dot.idx === 4;
          let className = 'step-dot';
          if (isComplete && !isCurrent) className = `step-dot step-dot-done ${isGold ? 'gold' : ''}`;
          else if (isCurrent) className = `step-dot step-dot-active ${isGold ? 'gold' : ''}`;

          const handleDotClick = () => {
            if (isComplete && !isCurrent) {
              const targetStep = STEP_ORDER[dot.idx];
              setCurrentStep(targetStep);
              setStepHistory((prev) => {
                const idx = prev.indexOf(targetStep);
                return idx !== -1 ? prev.slice(0, idx + 1) : [...prev, targetStep];
              });
            }
          };

          return (
            <div key={dot.idx} className="step-dot-wrapper">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className={className}
                  disabled={!isComplete || isCurrent}
                  onClick={handleDotClick}
                  aria-label={`Passo ${dot.idx}: ${STEP_DOT_LABELS[i]}`}
                >
                  {isComplete && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    dot.idx
                  )}
                </button>
                <span
                  className={`step-dot-label ${isCurrent ? 'active' : ''} ${isComplete && !isCurrent ? `done ${isGold ? 'gold' : ''}` : ''}`}
                >
                  {STEP_DOT_LABELS[i]}
                </span>
              </div>
              {i < stepDotStates.length - 1 && (
                <div
                  className={`step-dot-connector ${isComplete ? `done ${isGold ? 'gold' : ''}` : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500 w-full max-w-2xl mx-auto mt-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight px-4">
        Veja seu projeto <span className="text-primary">PRONTO</span> antes de começar a{' '}
        <span className="text-primary">DESENVOLVER</span>
      </h1>

      <div className="w-full glass-card rounded-2xl p-6 md:p-8 text-left text-foreground/90 space-y-4 border-gold-left glow-gold">
        <p className="font-medium text-lg border-b border-border/50 pb-4">
          Por um investimento de <span className="text-gold font-semibold text-xl">{PRICE}</span>, o pacote de Protótipo da{' '}
          <span className="text-primary font-semibold">Canis</span> entrega:
        </p>
        <ul className="space-y-3 pt-2">
          {[
            'Mapeamento da Jornada do Usuário e Arquitetura Técnica.',
            'Protótipo Visual de Alta Fidelidade.',
            'Telas interativas prontas para teste.',
            'Pesquisa de mercado.',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mr-3 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="social-proof w-full max-w-md">
        <strong>+50 empresas</strong> já validaram suas ideias com nossos protótipos
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <span className="lgpd-badge">
          <Zap className="w-3.5 h-3.5 text-[#25D366]" />
          Leva menos de 1 minuto — só 3 perguntas rápidas
        </span>

        <button
          onClick={() => goToStep('step1')}
          className="btn-cta w-full md:w-auto pulse-green shimmer-green relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 ease-in-out bg-[#25D366] rounded-xl hover:bg-[#128C7E] hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background group"
        >
          <SiWhatsapp className="w-6 h-6 mr-3 shrink-0" />
          <span className="text-lg">Preencher e chamar no Whatsapp</span>
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Seus dados vão direto para o nosso WhatsApp — resposta em até 24h
        </p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Vamos começar?</h2>
      <p className="text-muted-foreground text-center mb-8 text-lg">
        Rápido: só mais 3 perguntas e você fala com a gente no WhatsApp
      </p>

      <form onSubmit={handleContinue} className="space-y-5 glass-card p-8 rounded-2xl border-primary/20">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
            Nome completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={getInputClassName('name', formData.name)}
            placeholder="Seu nome"
          />
          {touchedFields.name && !formData.name.trim() && (
            <p className="validation-msg">Informe seu nome completo</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
            E-mail de trabalho
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={getInputClassName('email', formData.email)}
            placeholder="seu@email.com"
          />
          {touchedFields.email && !formData.email.trim() && (
            <p className="validation-msg">Informe seu e-mail</p>
          )}
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-muted-foreground mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={getInputClassName('whatsapp', formData.whatsapp)}
            placeholder="(11) 99999-9999"
          />
          {touchedFields.whatsapp && !formData.whatsapp.trim() && (
            <p className="validation-msg">Informe seu WhatsApp</p>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <span className="lgpd-badge">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Seus dados estão protegidos — LGPD
          </span>
        </div>

        <button
          type="submit"
          className="btn-cta w-full flex items-center justify-center px-8 py-5 mt-4 font-bold text-lg text-white transition-all duration-300 ease-in-out bg-primary rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-95 glow-primary shimmer-gold group"
        >
          <span>Continuar</span>
          <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Que tipo de projeto você quer desenvolver?
      </h2>
      <div className="space-y-3">
        {Object.entries(PROJECT_TYPE_LABELS).map(([id, label]) => (
          <button
            key={id}
            {...optionButtonProps('projectType', id, 'step3')}
            className={`w-full flex items-center justify-between p-5 rounded-2xl text-left cursor-pointer ${
              formData.projectType === id ? 'option-card-active' : 'option-card'
            }`}
          >
            <span className="text-lg font-medium">{label}</span>
            <ChevronRight
              className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                formData.projectType === id ? 'text-primary translate-x-1' : 'text-primary/40'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Qual o status do seu projeto?
      </h2>
      <div className="space-y-3">
        {PROJECT_STATUS_OPTIONS.map((option) => (
          <button
            key={option.id}
            {...optionButtonProps('projectStatus', option.id, 'step4')}
            className={`w-full flex items-center justify-between p-5 rounded-2xl text-left cursor-pointer ${
              formData.projectStatus === option.id ? 'option-card-active' : 'option-card'
            }`}
          >
            <span className="text-lg font-medium">{option.label}</span>
            <ChevronRight
              className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                formData.projectStatus === option.id ? 'text-primary translate-x-1' : 'text-primary/40'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 mt-6">
      <div className="flex flex-col items-center gap-2 mb-6">
        <span className="lgpd-badge">
          <Zap className="w-3.5 h-3.5 text-[#25D366]" />
          Última pergunta!
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
          O investimento para um MVP parte de {PRICE}. Como você planeja investir?
        </h2>
      </div>
      <div className="space-y-3">
        {BUDGET_OPTIONS.map((option) => (
          <button
            key={option.id}
            {...budgetButtonProps(option.id)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl text-left cursor-pointer gold-accent ${
              formData.budget === option.id ? 'option-card-active' : 'option-card'
            }`}
          >
            <span className="text-lg font-medium">{option.label}</span>
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 shrink-0 text-primary animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5 shrink-0 text-primary/40 transition-transform duration-200" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderResult = (isQualified: boolean) => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in fade-in duration-500 mt-10 relative">
      <div className="confetti-piece confetti-1" />
      <div className="confetti-piece confetti-2" />
      <div className="confetti-piece confetti-3" />
      <div className="confetti-piece confetti-4" />
      <div className="confetti-piece confetti-5" />
      <div className="confetti-piece confetti-gold-1" />
      <div className="confetti-piece confetti-gold-2" />
      <div className="confetti-piece confetti-gold-3" />
      <div className="confetti-piece confetti-gold-4" />
      <div className="confetti-piece confetti-green-1" />
      <div className="confetti-piece confetti-green-2" />
      <div className="confetti-piece confetti-green-3" />

      <div className="success-icon-animate w-24 h-24 bg-[#25D366]/20 rounded-full flex items-center justify-center mb-4 border border-[#25D366]/30 glow-green">
        <CheckCircle2 className="w-12 h-12 text-[#25D366]" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">Recebemos seus dados!</h2>
      <p className="text-xl text-muted-foreground max-w-md">
        Entraremos em contato em até 24h. Se preferir, pode me chamar direto no WhatsApp.
      </p>
      <a
        href={generateWhatsAppLink(isQualified)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta pulse-green inline-flex items-center justify-center px-10 py-5 font-bold text-lg text-white transition-all duration-300 bg-[#25D366] rounded-xl hover:bg-[#128C7E] hover:scale-105 shadow-[0_0_30px_rgba(37,211,102,0.3)] mt-4"
      >
        Falar no WhatsApp
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30 tech-grid relative overflow-x-hidden">
      <div className="blob-1 fixed top-[-20%] left-[-10%] w-[65%] h-[65%] rounded-full bg-primary/15 blur-[180px] pointer-events-none" />
      <div className="blob-2 fixed bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#2e7d89]/12 blur-[160px] pointer-events-none" />
      <div className="bg-scanline" />

      <div className="w-full flex flex-col items-center pt-10 pb-4 relative z-10 space-y-4">
        <img
          src="/canis_logo.webp"
          alt="Canis Logo"
          className="h-10 object-contain drop-shadow-[0_0_20px_rgba(46,125,137,0.4)]"
        />
        <div className="logo-divider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 block" />
        </div>

        {isFormStep && (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs px-4">
            <div
              className="progress-bar-track w-full h-1.5"
              role="progressbar"
              aria-valuenow={Math.round(progressPercentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso: passo ${currentIndex} de 4`}
            >
              <div
                className={`progress-bar-fill ${currentStep === 'step4' ? 'final-step' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Passo {currentIndex} de 4
            </span>
          </div>
        )}

        {isFormStep && renderStepDots()}
      </div>

      <main className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 pt-2 pb-20 w-full relative z-10">
        {showBack && (
          <div className="w-full max-w-2xl mb-4">
            <button onClick={goBack} className="btn-back">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>
        )}

        <div className="w-full max-w-2xl">
          {currentStep === 'intro' && renderIntro()}
          {currentStep === 'step1' && renderStep1()}
          {currentStep === 'step2' && renderStep2()}
          {currentStep === 'step3' && renderStep3()}
          {currentStep === 'step4' && renderStep4()}
          {currentStep === 'success' && renderResult(true)}
          {currentStep === 'unqualified' && renderResult(false)}
        </div>
      </main>
    </div>
  );
}

export default App;
