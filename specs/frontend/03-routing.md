# 03 — Roteamento e Guards

## Requirements
- React Router v6 com rotas protegidas por autenticação
- Rota de admin separada, acessível apenas para `perfil === "admin"`
- Layout compartilhado (sidebar + outlet) para rotas autenticadas
- Sidebar com navegação principal e indicador de usuário logado
- Redirecionamento automático: não autenticado → `/login`, não onboarded → `/onboarding`

## Spec
Configurar o sistema de roteamento completo. Rotas públicas (landing, login, signup) acessíveis sem token. Rotas privadas envolvidas em `ProtectedRoute` que verifica token e `isOnboarded`. Layout com sidebar só aparece nas rotas privadas pós-onboarding.

**Rotas:**
| Path | Componente | Guard |
|------|-----------|-------|
| `/` | LandingPage | público |
| `/login` | LoginPage | público |
| `/signup` | SignupPage | público |
| `/onboarding` | OnboardingPage | autenticado |
| `/home` | HomePage | autenticado + onboarded |
| `/chat/:friendId?` | ChatPage | autenticado + onboarded |
| `/friends` | FriendsPage | autenticado + onboarded |
| `/notifications` | NotificationsPage | autenticado + onboarded |
| `/profile` | ProfilePage | autenticado + onboarded |
| `/call/:friendId` | CallPage | autenticado + onboarded |
| `/admin` | AdminPage | autenticado + admin |
| `*` | NotFoundPage | público |

## Tasks
- [ ] Criar `src/router/ProtectedRoute.jsx` — verifica token; redireciona `/login` se ausente; redireciona `/onboarding` se não onboarded
- [ ] Criar `src/router/AdminRoute.jsx` — verifica `perfil === "admin"`, redireciona `/home` caso contrário
- [ ] Criar `src/router/AppRouter.jsx` — define todas as rotas com React Router v6 `createBrowserRouter`
- [ ] Criar `src/components/layout/Layout.jsx` — wrapper com Sidebar + `<Outlet />`
- [ ] Criar `src/components/layout/Sidebar.jsx` — links de navegação, avatar do usuário, botão de logout
- [ ] Atualizar `src/main.jsx` para usar `RouterProvider` com o router configurado
