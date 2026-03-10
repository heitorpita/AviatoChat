# 01 — Scaffold do Projeto

## Requirements
- Projeto React criado com Vite (template `react`)
- Tailwind CSS v4 configurado via plugin `@tailwindcss/vite`
- Tokens de cor da marca definidos em `index.css` via `@theme {}`
- shadcn/ui inicializado e configurado
- Estrutura de pastas padrão do projeto criada
- Script `dev` rodando na porta 5173

## Spec
Criar o projeto base do frontend dentro da pasta `frontend/`. O projeto deve ter Tailwind v4 com os tokens de cor da marca AviatoChat, shadcn/ui pronto para uso, e a estrutura de pastas organizada para escalar com todas as features.

**Paleta de Cores:**

| Token | Hex | Uso |
|-------|-----|-----|
| `brand-sky` | `#8ecae6` | Elementos secundários, ícones, hover states |
| `brand-teal` | `#219ebc` | Botões primários, links, accents, elementos interativos |
| `brand-navy` | `#023047` | Headers, texto principal, backgrounds escuros, sidebar |
| `brand-amber` | `#ffb703` | CTAs principais, badges, elementos de destaque |
| `brand-orange` | `#fb8500` | Hover dos CTAs, notificações importantes, badges de contador |

**Light Mode:**
- Background: `#ffffff` | Foreground: `#023047`
- Primary: `#023047` | Secondary: `#8ecae6` | Accent: `#219ebc`
- Muted: `#e8f4f8` | Border: `rgba(33,158,188,0.2)`

**Dark Mode:**
- Background: `#011a27` | Foreground: `#8ecae6`
- Card: `#023047` | Primary: `#8ecae6` | Secondary: `#219ebc`

**Padrões de uso:**
- Gradientes: `from-[#8ecae6] via-[#219ebc] to-[#023047]`
- Botões CTA: `bg-[#ffb703] hover:bg-[#fb8500]`
- Botões primários: `bg-[#219ebc] hover:bg-[#023047]`
- Sidebar: `bg-[#023047]` com texto branco
- Status online: `#10b981` (verde)

**Estrutura de pastas:**
```
frontend/src/
  api/
  components/
    layout/
    ui/
  hooks/
  lib/
  pages/
  router/
  store/
```

## Tasks
- [ ] Rodar `npm create vite@latest . -- --template react` dentro de `frontend/`
- [ ] Instalar dependências: `tailwindcss @tailwindcss/vite react-router-dom zustand @tanstack/react-query axios socket.io-client`
- [ ] Instalar devDependências: `@types/node`
- [ ] Configurar plugin Tailwind no `vite.config.js`
- [ ] Adicionar tokens de cor da marca no `index.css` via `@theme {}`
- [ ] Remover arquivos boilerplate do Vite (App.css, assets/react.svg, conteúdo do App.jsx)
- [ ] Rodar `npx shadcn@latest init` e configurar (style: default, base color: neutral, CSS variables: yes)
- [ ] Criar estrutura de pastas em `src/`
- [ ] Verificar que `npm run dev` sobe sem erros
