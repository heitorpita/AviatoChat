# 12 — CSS Mobile Responsivo
**Data:** 2026-03-10

## Requirements
- ChatPage funcional no mobile: lista de amigos e área de chat em painéis alternados
- Navbar/menu de navegação acessível no mobile
- HomePage com grid adequado para telas pequenas
- Formulários (Onboarding, Profile) legíveis e usáveis no mobile
- Sem overflow horizontal em nenhuma página
- CallPage: vídeos empilhados verticalmente no mobile

## Spec

### Meta viewport — `frontend/index.html`
Verificar se existe (provavelmente já tem via Vite):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

### ChatPage — Painel alternado (sidebar ↔ chat)

**Comportamento mobile:**
- Por padrão: mostra lista de amigos (sidebar)
- Ao clicar num amigo: esconde sidebar, mostra área de chat
- Botão "← Voltar" no header do chat: retorna à sidebar

**Implementação:**
```jsx
const [showSidebar, setShowSidebar] = useState(true);

// Ao selecionar amigo no mobile → esconder sidebar
const handleSelectFriend = (friend) => {
  setSelectedFriend(friend);
  setShowSidebar(false); // mobile: vai para o chat
};
```

**Layout:**
```jsx
<div className="flex h-screen">
  {/* Sidebar — oculta no mobile quando chat aberto */}
  <div className={`
    w-full md:w-72 lg:w-80 flex-shrink-0
    ${showSidebar ? "flex" : "hidden"} md:flex
    flex-col bg-brand-navy
  `}>
    {/* lista de amigos */}
  </div>

  {/* Área de chat — oculta no mobile quando sidebar visível */}
  <div className={`
    flex-1
    ${!showSidebar ? "flex" : "hidden"} md:flex
    flex-col
  `}>
    {/* Header com botão voltar no mobile */}
    <div className="flex items-center gap-3 p-4 border-b">
      <button
        className="md:hidden text-brand-navy"
        onClick={() => setShowSidebar(true)}
      >
        ← Voltar
      </button>
      {/* nome do amigo, status */}
    </div>
    {/* mensagens + input */}
  </div>
</div>
```

**Input de mensagem fixo no fundo:**
```jsx
<div className="p-3 border-t bg-white sticky bottom-0">
  {/* input + botões */}
</div>
```

**Balões — max-width menor no mobile:**
```jsx
<div className={`max-w-[80%] sm:max-w-xs md:max-w-md ...`}>
```

---

### Navbar / Menu de Navegação

**Bottom tab bar no mobile** (mais natural em mobile):
```jsx
// Desktop: sidebar vertical esquerda (comportamento atual)
// Mobile: barra de tabs na base da tela

<nav className="
  fixed bottom-0 left-0 right-0 z-50
  flex md:hidden
  bg-brand-navy border-t border-brand-teal/30
  pb-safe  /* safe area para iPhone */
">
  <NavTab icon={<HomeIcon />} label="Home" to="/home" />
  <NavTab icon={<UsersIcon />} label="Amigos" to="/friends" />
  <NavTab icon={<ChatIcon />} label="Chat" to="/chat" />
  <NavTab icon={<BellIcon />} label="Avisos" to="/notifications" />
  <NavTab icon={<UserIcon />} label="Perfil" to="/profile" />
</nav>

{/* Padding para não sobrepor conteúdo */}
<main className="pb-16 md:pb-0">
```

---

### HomePage — Grid responsivo

```jsx
{/* Grid: 1 col mobile, 2 tablet, 3 desktop */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  {users.map(user => <PartnerCard key={user.id} user={user} />)}
</div>
```

**Cards de parceiro — ajustes mobile:**
- Padding interno menor: `p-4` em vez de `p-6`
- Bio truncada com `line-clamp-2`
- Botão "Adicionar" full-width no mobile: `w-full sm:w-auto`

---

### OnboardingPage e ProfilePage — Formulários

```jsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-8">
    {/* todos inputs: w-full */}
    {/* select de idioma: w-full */}
    {/* foto: centralizada */}
  </div>
</div>
```

**Selects de idioma lado a lado no desktop, empilhados no mobile:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Select label="Idioma nativo" ... />
  <Select label="Quero aprender" ... />
</div>
```

---

### CallPage — Vídeo empilhado no mobile

```jsx
{/* Desktop: lado a lado. Mobile: empilhado */}
<div className="flex flex-col md:flex-row gap-4 p-4 h-screen">
  <video className="w-full md:w-1/2 rounded-xl" ref={remoteVideoRef} autoPlay />
  <video className="w-full md:w-1/2 rounded-xl opacity-80" ref={localVideoRef} autoPlay muted />
</div>

{/* Botões de controle centralizados na base */}
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
  <button>🎤</button>
  <button>📷</button>
  <button className="bg-red-500">📵</button>
</div>
```

---

### Ajustes Globais — `index.css`

```css
/* Prevenir scroll horizontal */
html, body {
  overflow-x: hidden;
}

/* Safe area para dispositivos com notch (iPhone) */
:root {
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}

.pb-safe {
  padding-bottom: max(0.75rem, var(--safe-area-bottom));
}
```

---

## Arquivos a Modificar
| Arquivo | Mudanças |
|---------|---------|
| `frontend/index.html` | Verificar meta viewport |
| `frontend/src/pages/ChatPage.jsx` | Painel alternado, botão voltar, input sticky |
| `frontend/src/pages/HomePage.jsx` | Grid responsivo, cards ajustados |
| `frontend/src/pages/OnboardingPage.jsx` | Layout de formulário mobile |
| `frontend/src/pages/ProfilePage.jsx` | Layout de formulário mobile |
| `frontend/src/pages/CallPage.jsx` | Vídeos empilhados, botões centralizados |
| `frontend/src/components/Navbar.jsx` | Bottom tab bar no mobile |
| `frontend/src/index.css` | overflow-x, safe area |

## Verificação
Testar em 3 viewports: iPhone SE (375px), tablet (768px), desktop (1280px):
1. ChatPage: sidebar ↔ chat alterna corretamente no mobile
2. ChatPage: input de mensagem não some atrás do teclado virtual
3. HomePage: grid de 1 coluna no mobile sem overflow
4. Navbar: bottom tabs visíveis e funcionais no mobile
5. OnboardingPage: formulário completo sem scroll horizontal
6. CallPage: vídeos empilhados no mobile, botões acessíveis
