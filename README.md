# 🐕 Landing Page — Captação de Leads (Meta Ads) · Canis / Alpha House

> Funil de pré-qualificação de leads para campanhas de tráfego pago no Meta (Facebook/Instagram Ads), focado em conversão de protótipos de software.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Como Funciona o Funil](#-como-funciona-o-funil)
3. [Stack Técnica](#-stack-técnica)
4. [Estrutura de Arquivos](#-estrutura-de-arquivos)
5. [Instalação e Desenvolvimento](#-instalação-e-desenvolvimento)
6. [Variáveis que Você Precisa Configurar](#-variáveis-que-você-precisa-configurar)
7. [Integração com n8n (Webhook)](#-integração-com-n8n-webhook)
8. [Pixel do Meta (Facebook)](#-pixel-do-meta-facebook)
9. [Deploy](#-deploy)
10. [Lógica de Qualificação de Leads](#-lógica-de-qualificação-de-leads)
11. [Customização Visual](#-customização-visual)

---

## 🎯 Visão Geral

Esta landing page é um **formulário multi-step** (funil em etapas) projetado para:

- Capturar leads qualificados vindos de anúncios no Meta
- **Pré-qualificar** o lead com 3 perguntas antes de coletar os dados de contato
- Disparar o evento de conversão do Pixel do Meta **somente para leads qualificados**
- Enviar os dados para um webhook do **n8n** para automação (CRM, WhatsApp, e-mail etc.)
- Redirecionar todos os leads (qualificados ou não) para o WhatsApp com mensagem pré-preenchida

O foco da página é **o formulário**. O design é intencional: dark mode, glassmorphism e animações sutis para alta conversão sem poluição visual.

---

## 🔄 Como Funciona o Funil

```
[Anúncio Meta] → [Landing Page]
                      │
                      ▼
               ┌─────────────┐
               │   INTRO     │  Apresenta o produto e o preço
               │  (Tela 0)   │  Botão "Começar Agora"
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │   STEP 1    │  Qual tipo de projeto?
               │             │  Web / Mobile / IA / Outro
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │   STEP 2    │  Status atual do projeto?
               │             │  Ideia / Iniciado / Refazer
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │   STEP 3    │  Orçamento disponível?
               │             │  ✅ Tenho / ✅ Tenho mas / ❌ Menor
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │   STEP 4    │  Nome + E-mail + WhatsApp
               │ (Formulário)│  → Envia para Webhook n8n
               └──────┬──────┘
                      │
            ┌─────────┴──────────┐
            ▼                    ▼
     Orçamento OK?         Orçamento menor?
     [SUCESSO]              [NÃO QUALIFICADO]
     ✅ fbq('Lead')          ❌ sem evento Meta
     → WhatsApp             → WhatsApp (sem conversão)
```

> ⚠️ **Importante:** A página de não qualificados é visualmente idêntica à de qualificados — ambas vão para o WhatsApp. A diferença é que o Pixel do Meta **não dispara** para leads sem orçamento, protegendo a otimização da campanha.

---

## 🛠 Stack Técnica

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Interface e lógica de estado |
| TypeScript | 6 | Tipagem segura |
| Vite | 8 | Bundler e dev server |
| Tailwind CSS | 3.4 | Utilitários de estilo |
| Lucide React | 1.17 | Ícones |
| CSS puro | — | Animações (shimmer, blobs, confetti) |

**Sem bibliotecas de animação** (Framer Motion, GSAP etc.) — todas as animações são CSS puro para garantir máxima performance.

---

## 📁 Estrutura de Arquivos

```
landing-page-prototipo-meta-canis/
│
├── public/
│   └── canis_logo.webp          # Logo da Canis (otimizado)
│
├── src/
│   ├── App.tsx                  # ⭐ Componente principal — toda a lógica do funil
│   ├── index.css                # ⭐ Design system — glass cards, animações, cores
│   ├── App.css                  # Estilos globais mínimos
│   └── main.tsx                 # Ponto de entrada React
│
├── index.html                   # HTML base — Pixel do Meta vai aqui
├── tailwind.config.js           # Configuração de cores (--primary = #2e7d89)
├── vite.config.ts               # Configuração do Vite
├── tsconfig.app.json            # Configuração TypeScript
└── package.json
```

### Onde mexer para cada ajuste

| O que mudar | Arquivo |
|---|---|
| Textos, perguntas, opções do funil | `src/App.tsx` |
| Cores, animações, efeitos visuais | `src/index.css` |
| Cor primária da marca | `tailwind.config.js` → `primary.DEFAULT` |
| Número do WhatsApp | `src/App.tsx` → `WHATSAPP_NUMBER` |
| URL do webhook | `src/App.tsx` → `WEBHOOK_URL` |
| Pixel do Meta | `index.html` → script no `<head>` |
| Logo | `public/canis_logo.webp` |

---

## 🚀 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/viniciusmoreira1533/landing-page-prototipo-meta-canis.git
cd landing-page-prototipo-meta-canis

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# → Acesse http://localhost:5173
```

### Outros comandos

```bash
npm run build    # Gera o build de produção em /dist
npm run preview  # Visualiza o build de produção localmente
npm run lint     # Verifica erros de código
```

---

## ⚙️ Variáveis que Você Precisa Configurar

Abra o arquivo `src/App.tsx` e localize estas constantes no topo do arquivo:

```typescript
// ← Linha 15: URL do seu webhook no n8n
const WEBHOOK_URL = 'https://seu-n8n.dominio.com/webhook/SEU-ID-AQUI';

// ← Linha 16: Número do WhatsApp com DDI (sem + e sem espaços)
const WHATSAPP_NUMBER = '5511999999999';
//                       ↑↑  ↑↑  ↑↑↑↑↑↑↑
//                       DDI DDD  Número
```

> ⚠️ **Nunca suba credenciais privadas no repositório.** Para variáveis sensíveis em produção, use variáveis de ambiente via `.env`.

---

## 🔗 Integração com n8n (Webhook)

Ao enviar o formulário (Step 4), a página faz um `POST` para o `WEBHOOK_URL` com o seguinte payload JSON:

```json
{
  "projectType": "web",
  "projectStatus": "ideia",
  "budget": "agora",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "whatsapp": "(11) 99999-9999",
  "submittedAt": "2025-01-15T18:30:00.000Z",
  "isQualified": true
}
```

### Campos do payload

| Campo | Valores possíveis | Descrição |
|---|---|---|
| `projectType` | `web`, `mobile`, `ai`, `outro` | Tipo de projeto |
| `projectStatus` | `ideia`, `iniciado`, `refazer` | Status atual |
| `budget` | `agora`, `prazos`, `menor` | Disponibilidade de orçamento |
| `name` | string | Nome completo |
| `email` | string | E-mail |
| `whatsapp` | string | Telefone |
| `submittedAt` | ISO 8601 | Data/hora do envio |
| `isQualified` | `true` / `false` | `false` apenas se `budget === "menor"` |

> 💡 **Dica n8n:** Filtre pela propriedade `isQualified` no seu workflow para separar os fluxos de atendimento qualificado e não qualificado.

---

## 📊 Pixel do Meta (Facebook)

O código do Pixel do Meta deve ser inserido no `index.html`, dentro da tag `<head>`:

```html
<head>
  <!-- ... outras tags ... -->

  <!-- Meta Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s){/* código do pixel */}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'SEU_PIXEL_ID_AQUI');
    fbq('track', 'PageView');
  </script>
  <noscript>
    <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=SEU_PIXEL_ID_AQUI&ev=PageView&noscript=1"/>
  </noscript>
  <!-- End Meta Pixel Code -->
</head>
```

### Eventos disparados automaticamente

| Evento | Quando dispara | Onde está no código |
|---|---|---|
| `PageView` | Ao carregar a página | `index.html` (script do Pixel) |
| `Lead` | Apenas para leads **qualificados** | `src/App.tsx` linha ~85 |

```typescript
// src/App.tsx — somente para budget !== 'menor'
if (typeof window !== 'undefined' && (window as any).fbq) {
  (window as any).fbq('track', 'Lead');
}
```

> ⚠️ **Nunca dispare o evento `Lead` para leads não qualificados.** Isso vai ensinar o algoritmo do Meta a buscar perfis com baixo poder aquisitivo, degradando os resultados da campanha.

---

## 🌐 Deploy

### Opção 1 — Vercel (recomendado)

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça o deploy (na primeira vez, siga o wizard)
vercel

# Deploy de produção
vercel --prod
```

### Opção 2 — Build manual

```bash
# Gera os arquivos estáticos em /dist
npm run build

# Suba o conteúdo da pasta /dist para qualquer
# hosting de arquivos estáticos:
# - Netlify Drop (drag & drop)
# - GitHub Pages
# - S3 + CloudFront
# - Hostinger / GoDaddy
```

---

## 🎨 Lógica de Qualificação de Leads

A qualificação acontece no Step 3 (orçamento). A lógica é simples:

```
budget === 'menor'  →  isQualified = false  →  sem evento Meta
budget === 'agora'  →  isQualified = true   →  dispara fbq('Lead')
budget === 'prazos' →  isQualified = true   →  dispara fbq('Lead')
```

Mesmo sendo "não qualificado", o lead:
- ✅ Recebe a mesma tela de confirmação visual
- ✅ É enviado para o webhook do n8n (com `isQualified: false`)
- ✅ É redirecionado para o WhatsApp com mensagem contextualizada
- ❌ **NÃO** dispara o evento `Lead` no Pixel do Meta

---

## 🎨 Customização Visual

### Trocar a cor principal da marca

Em `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: "#2e7d89",  // ← Troque para a cor da sua marca (hex)
  },
}
```

Em `src/index.css`, atualize o HSL equivalente em todas as ocorrências de `188 50% 36%`:

```
#2e7d89  →  HSL(188, 50%, 36%)
```

### Classes CSS personalizadas (em `index.css`)

| Classe | Efeito |
|---|---|
| `.glass-card` | Card translúcido com blur e borda sutil |
| `.glass-card:hover` | Borda e glow da cor primária |
| `.glass-card-active` | Estado selecionado |
| `.option-card` | Botão de múltipla escolha dos steps |
| `.option-card-active` | Opção selecionada |
| `.btn-cta` | Botão CTA com efeito shimmer animado |
| `.glow-primary` | Glow/sombra na cor primária |
| `.tech-grid` | Grade tecnológica de fundo |
| `.blob-1` / `.blob-2` | Gradientes de fundo animados (GPU) |
| `.bg-scanline` | Linha de luz que varre o fundo |
| `.input-styled` | Input de formulário dark mode |
| `.success-icon-animate` | Animação de pop no ícone de sucesso |

---

## 📞 Suporte

Dúvidas ou ajustes? Fala comigo no WhatsApp ou abre uma issue no repositório.

---

*Desenvolvido para Canis / Alpha House — Campanha Meta Ads 2025*
