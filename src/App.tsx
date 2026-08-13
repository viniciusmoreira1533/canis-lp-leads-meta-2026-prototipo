import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import {
  WEBHOOK_URL,
  WHATSAPP_NUMBER,
  PRICE,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_OPTIONS,
  BUDGET_OPTIONS,
} from './config';

type PageId =
  | 'hero'
  | 'oferta'
  | 'pipe'
  | 'passos'
  | 'q-tipo'
  | 'q-status'
  | 'q-orc'
  | 'q-dados'
  | 'success';

const PAGES: PageId[] = ['hero', 'oferta', 'pipe', 'passos', 'q-tipo', 'q-status', 'q-orc', 'q-dados', 'success'];
const NAV_CAPS: PageId[] = ['hero', 'oferta', 'pipe', 'passos'];
const QUIZ_PAGES: PageId[] = ['q-tipo', 'q-status', 'q-orc', 'q-dados'];

const WHATSAPP_MESSAGE_QUALIFIED = (nome: string, produto: string, estado: string) =>
  `Oi, meu nome é ${nome}. Vi o anúncio na Meta sobre os protótipos, preciso de um protótipo de ${produto}, atualmente meu projeto está ${estado}. Gostaria de conversar.`;

const WHATSAPP_MESSAGE_UNQUALIFIED = (nome: string, produto: string, estado: string) =>
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

interface Answers {
  tipo?: string;
  status?: string;
  orc?: string;
  name?: string;
  email?: string;
  whatsapp?: string;
}

function App() {
  const [current, setCurrent] = useState<PageId>(() => {
    const m = location.hash.match(/^#\/(\d+)/);
    if (!m) return 'hero';
    const idx = Math.min(PAGES.length - 1, parseInt(m[1], 10));
    return PAGES[idx];
  });
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockTimer = useRef<number | null>(null);

  const lock = () => {
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    setLocked(true);
    lockTimer.current = window.setTimeout(() => setLocked(false), 1500);
  };

  const goto = (target: PageId) => {
    setCurrent(target);
    lock();
    try {
      history.replaceState(null, '', '#/' + PAGES.indexOf(target));
    } catch {
      /* ignore */
    }
  };

  const readHash = (): PageId => {
    const m = location.hash.match(/^#\/(\d+)/);
    if (!m) return 'hero';
    const idx = Math.min(PAGES.length - 1, parseInt(m[1], 10));
    return PAGES[idx];
  };

  useEffect(() => {
    const onHash = () => setCurrent(readHash());
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    };
  }, []);

  const isQuiz = QUIZ_PAGES.includes(current);
  const isSuccess = current === 'success';
  const isFirst = current === 'hero';
  const idx = PAGES.indexOf(current);
  const isCap = NAV_CAPS.includes(current);

  const generateWhatsAppLink = () => {
    const produto = PROJECT_TYPE_LABELS[answers.tipo || ''] || 'tecnologia';
    const estado = PROJECT_STATUS_LABELS[answers.status || ''] || 'em planejamento';
    const isQualified = answers.orc !== 'menor';
    const text = isQualified
      ? WHATSAPP_MESSAGE_QUALIFIED(answers.name || '', produto, estado)
      : WHATSAPP_MESSAGE_UNQUALIFIED(answers.name || '', produto, estado);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleSelect = (field: keyof Answers, value: string) => {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [field]: value }));
    const next: Partial<Record<PageId, PageId>> = {
      'q-tipo': 'q-status',
      'q-status': 'q-orc',
      'q-orc': 'q-dados',
    };
    goto(next[current] || 'success');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({
      ...prev,
      [name]: name === 'whatsapp' ? formatWhatsApp(value) : value,
    }));
  };

  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouchedFields((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const getInputClassName = (name: string, value: string | undefined) => {
    const base = 'field-input';
    if (!touchedFields[name]) return base;
    if (value && value.trim()) return `${base} input-valid`;
    return `${base} input-invalid`;
  };

  const submitLead = async (e: FormEvent) => {
    e.preventDefault();
    if (locked) return;
    const allTouched: Record<string, boolean> = { name: true, email: true, whatsapp: true };
    setTouchedFields((prev) => ({ ...prev, ...allTouched }));

    const name = (answers.name || '').trim();
    const email = (answers.email || '').trim();
    const whatsapp = (answers.whatsapp || '').trim();
    if (!name || !email || !whatsapp) return;

    const isQualified = answers.orc !== 'menor';
    setIsSubmitting(true);

    try {
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectType: answers.tipo,
            projectStatus: answers.status,
            budget: answers.orc,
            name,
            email,
            whatsapp: whatsapp.replace(/\D/g, ''),
            submittedAt: new Date().toISOString(),
            isQualified,
            source: 'lp-prototipos',
          }),
        });
      }

      if (isQualified && window.fbq) {
        window.fbq('track', 'Lead');
      }
    } catch {
      // segue para o sucesso mesmo se o webhook falhar
    } finally {
      setIsSubmitting(false);
      goto('success');
    }
  };

  const nextLabel = isQuiz || isFirst ? 'Continuar ↓' : 'Continuar →';

  return (
    <div className="app-shell">
      <div className="grid" />
      <div className="glows" />

      <header className="bar">
        <div className="logo" role="img" aria-label="Canis" />
      </header>

      <div className={`dots ${isCap ? 'show' : ''}`}>
        {NAV_CAPS.map((cap, i) => (
          <span
            key={cap}
            className={`dot ${i < idx ? 'done' : i === idx ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className={`quiz-bar ${isQuiz ? 'show' : ''}`}>
        {QUIZ_PAGES.map((q, i) => (
          <span
            key={q}
            className={`pill ${i < idx - 4 ? 'done' : i === idx - 4 ? 'active' : ''}`}
          />
        ))}
      </div>

      <main className="pages">
        {/* PÁGINA 0 · HERO */}
        <section className={`page ch-hero ${current === 'hero' ? 'active' : ''}`} id="pg-hero">
          <div className="page-inner">
            <span className="badge">Desenvolvimento de apps e sistemas</span>
            <h1>
              Seu app ou sistema <em>pronto</em> na tela,{' '}
              <span className="gold-grad">antes de escrever uma linha de código</span>
            </h1>
            <p className="sub">
              A Canis desenvolve apps e sistemas <b>do zero ao lançamento</b>. O protótipo é a
              primeira etapa: telas navegáveis, plano de trabalho e orçamento fechado do projeto
              inteiro.
            </p>
          </div>
        </section>

        {/* PÁGINA 1 · OFERTA */}
        <section className={`page ${current === 'oferta' ? 'active' : ''}`} id="pg-oferta">
          <div className="page-inner">
            <div className="sec-head">
              <span className="k">A oferta</span>
              <h2>O que você recebe</h2>
            </div>
            <div className="offer">
              <div className="price-row">
                <span className="price">
                  <span className="gold-grad">{PRICE}</span>
                </span>
                <span className="price-note">investimento do protótipo</span>
              </div>
              <ul>
                <li>
                  <span className="ic">✓</span> Protótipo visual navegável do seu app ou sistema — o
                  front-end em alta fidelidade
                </li>
                <li>
                  <span className="ic">✓</span> Mapeamento da jornada do usuário e arquitetura
                  técnica
                </li>
                <li>
                  <span className="ic">✓</span> Plano de trabalho e orçamento do desenvolvimento
                  completo
                </li>
                <li>
                  <span className="ic">✓</span> Pesquisa de mercado para validar a ideia antes de
                  investir
                </li>
              </ul>
              <p className="foot">
                Depois do protótipo, você pode seguir com a Canis no{' '}
                <b>desenvolvimento e implementação</b> — a mesma equipe do início ao fim.
              </p>
            </div>
            <div className="proof">
              <b>+50 empresas</b> já validaram seus apps e sistemas com os protótipos da Canis
            </div>
          </div>
        </section>

        {/* PÁGINA 2 · PIPELINE */}
        <section className={`page ${current === 'pipe' ? 'active' : ''}`} id="pg-pipe">
          <div className="page-inner">
            <div className="sec-head">
              <span className="k">Da ideia ao app no ar</span>
              <h2>O caminho completo do seu projeto</h2>
            </div>
            <div className="pipe">
              <div className="pipe-steps">
                <div className="pipe-step">
                  <span className="dot" />
                  <div>
                    <h3>
                      <span className="n">Etapa 1 · Protótipo</span>Valide a ideia e o orçamento
                    </h3>
                    <p>Telas navegáveis + plano de trabalho com prazos e orçamento fechado.</p>
                  </div>
                </div>
                <span className="pipe-link" aria-hidden="true" />
                <div className="pipe-step">
                  <span className="dot" />
                  <div>
                    <h3>
                      <span className="n">Etapa 2 · Desenvolvimento</span>A equipe constrói o app ou
                      sistema
                    </h3>
                    <p>Desenvolvimento completo com a mesma equipe que desenhou o protótipo.</p>
                  </div>
                </div>
                <span className="pipe-link" aria-hidden="true" />
                <div className="pipe-step">
                  <span className="dot" />
                  <div>
                    <h3>
                      <span className="n">Etapa 3 · Implementação</span>Publicamos e acompanhamos no
                      ar
                    </h3>
                    <p>Deploy, configuração e suporte no lançamento.</p>
                  </div>
                </div>
              </div>
              <p className="tagline">
                <b>Tudo com a mesma equipe.</b> Sem trocar de fornecedor no meio do caminho.
              </p>
            </div>
          </div>
        </section>

        {/* PÁGINA 3 · COMO FUNCIONA */}
        <section className={`page ${current === 'passos' ? 'active' : ''}`} id="pg-passos">
          <div className="page-inner">
            <div className="sec-head">
              <span className="k">Como funciona</span>
              <h2>Do formulário ao protótipo em 4 passos</h2>
            </div>
            <div className="steps">
              <div className="step">
                <span className="num">1</span>
                <div>
                  <h3>Você preenche o formulário</h3>
                  <p>3 perguntas rápidas — leva 1 minuto.</p>
                </div>
              </div>
              <div className="step">
                <span className="num">2</span>
                <div>
                  <h3>Falamos no WhatsApp</h3>
                  <p>Respondemos e tiramos suas dúvidas direto por lá.</p>
                </div>
              </div>
              <div className="step">
                <span className="num">3</span>
                <div>
                  <h3>Agendamos uma call</h3>
                  <p>Para entender seu projeto a fundo.</p>
                </div>
              </div>
              <div className="step">
                <span className="num">4</span>
                <div>
                  <h3>Fechamos o protótipo</h3>
                  <p>Telas navegáveis + plano de trabalho com prazos e orçamento do desenvolvimento completo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PÁGINA 4 · QUIZ TIPO */}
        <section className={`page quiz ${current === 'q-tipo' ? 'active' : ''}`} id="pg-q1">
          <div className="page-inner">
            <span className="q-label">Pergunta 1 de 4</span>
            <h2>Que tipo de projeto você quer desenvolver?</h2>
            <p className="q-sub">Isso ajuda a Canis a montar o protótipo certo para você.</p>
            <div className="opts">
              {Object.entries(PROJECT_TYPE_LABELS).map(([id, label]) => (
                <button
                  key={id}
                  className={`opt ${answers.tipo === id ? 'sel' : ''}`}
                  onClick={() => handleSelect('tipo', id)}
                >
                  {label} <span className="arr">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PÁGINA 5 · QUIZ STATUS */}
        <section className={`page quiz ${current === 'q-status' ? 'active' : ''}`} id="pg-q2">
          <div className="page-inner">
            <span className="q-label">Pergunta 2 de 4</span>
            <h2>Qual o status do seu projeto?</h2>
            <p className="q-sub">Queremos entender onde você está hoje.</p>
            <div className="opts">
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`opt ${answers.status === option.id ? 'sel' : ''}`}
                  onClick={() => handleSelect('status', option.id)}
                >
                  {option.label} <span className="arr">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PÁGINA 6 · QUIZ ORÇAMENTO */}
        <section className={`page quiz ${current === 'q-orc' ? 'active' : ''}`} id="pg-q3">
          <div className="page-inner">
            <span className="q-label">Pergunta 3 de 4</span>
            <h2>Como você planeja investir?</h2>
            <p className="q-sub">
              O protótipo custa <b>{PRICE}</b>. Depois dele, você recebe o orçamento exato do
              desenvolvimento completo.
            </p>
            <div className="opts">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`opt ${answers.orc === option.id ? 'sel' : ''}`}
                  onClick={() => handleSelect('orc', option.id)}
                >
                  {option.label} <span className="arr">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PÁGINA 7 · QUIZ DADOS */}
        <section className={`page quiz ${current === 'q-dados' ? 'active' : ''}`} id="pg-q4">
          <div className="page-inner">
            <span className="q-label">Pergunta 4 de 4</span>
            <h2>Onde a gente te chama?</h2>
            <p className="q-sub">Seus dados vão direto para o WhatsApp da Canis — resposta em até 24h.</p>
            <form id="form" className="form-grid" onSubmit={submitLead} noValidate>
              <div className="field">
                <label htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  name="name"
                  placeholder="Seu nome"
                  required
                  value={answers.name || ''}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('name', answers.name)}
                />
                {touchedFields.name && !answers.name?.trim() && (
                  <p className="validation-msg">Informe seu nome completo</p>
                )}
              </div>
              <div className="field">
                <label htmlFor="email">E-mail de trabalho</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  required
                  value={answers.email || ''}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('email', answers.email)}
                />
                {touchedFields.email && !answers.email?.trim() && (
                  <p className="validation-msg">Informe seu e-mail</p>
                )}
              </div>
              <div className="field wide">
                <label htmlFor="whats">WhatsApp</label>
                <input
                  id="whats"
                  name="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  required
                  value={answers.whatsapp || ''}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getInputClassName('whatsapp', answers.whatsapp)}
                />
                {touchedFields.whatsapp && !answers.whatsapp?.trim() && (
                  <p className="validation-msg">Informe seu WhatsApp</p>
                )}
              </div>
              <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Fechar protótipo →'}
              </button>
            </form>
          </div>
        </section>

        {/* PÁGINA 8 · SUCESSO */}
        <section className={`page ${current === 'success' ? 'active' : ''}`} id="pg-success">
          <div className="page-inner success">
            <div className="check">✓</div>
            <h2>Recebemos seus dados!</h2>
            <p>Vamos te chamar no WhatsApp para agendar uma call e fechar seu protótipo.</p>
            <a
              className="wa"
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp agora
            </a>
          </div>
        </section>
      </main>

      {/* BARRA INFERIOR */}
      <div className="nav-wrap">
        <div className={`nav-row ${isQuiz ? 'quiz-mode' : ''} ${locked ? 'locked' : ''}`}>
          {!isFirst && !isSuccess && (
            <button className="nav-btn back" onClick={() => !locked && goto(PAGES[idx - 1])}>
              ← Voltar
            </button>
          )}
          {!isSuccess && !isQuiz && (
            <button
              className="nav-btn next"
              onClick={() => !locked && goto(PAGES[idx + 1])}
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
