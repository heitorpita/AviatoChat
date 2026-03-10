# 04 — Páginas de Autenticação

## Requirements
- LandingPage pública com apresentação do produto e CTAs para signup/login
- LoginPage com formulário email + senha, feedback de erro, redirect para `/home` após login
- SignupPage com formulário fullName + email + senha, redirect para `/onboarding` após cadastro
- OnboardingPage para completar o perfil: idioma nativo, idioma que está aprendendo, bio, foto de perfil (URL), localização
- Após onboarding, redirect para `/home`
- Formulários usando shadcn/ui (Input, Button, Label, Card)

## Spec
Páginas de autenticação com UX clara e responsiva. Usar TanStack Query mutations para chamadas à API. Armazenar token e usuário na auth store após login/signup. A OnboardingPage é obrigatória após o cadastro — o `ProtectedRoute` força esse fluxo.

**Visual:**
- Fundo com gradiente oceânico `from-[#8ecae6] via-[#219ebc] to-[#023047]`
- Cards brancos centralizados com sombra suave
- Botões CTA em `#ffb703` hover `#fb8500`
- Botões primários em `#219ebc` hover `#023047`

**Idiomas disponíveis para onboarding (lista de opções):**
Inglês, Português, Espanhol, Francês, Alemão, Italiano, Japonês, Mandarim, Coreano, Árabe, Russo, Hindi, e outros.

## Tasks
- [ ] Criar `src/pages/LandingPage.jsx` — hero section, features, CTA para signup e login
- [ ] Criar `src/pages/LoginPage.jsx` — form com validação básica, mutation de login, feedback de erro
- [ ] Criar `src/pages/SignupPage.jsx` — form com fullName/email/senha, mutation de signup
- [ ] Criar `src/pages/OnboardingPage.jsx` — selects de idioma, campos de bio/foto/localização, mutation de onboard
- [ ] Garantir que após login/signup o token e user são salvos na auth store
- [ ] Garantir redirecionamentos corretos após cada ação
