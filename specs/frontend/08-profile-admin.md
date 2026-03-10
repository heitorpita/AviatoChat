# 08 — Perfil e Admin

## Requirements
- ProfilePage permite editar bio, foto de perfil, localização e idiomas
- Mudanças salvas via `PUT /api/users/onboard` (mesmo endpoint do onboarding)
- AdminPage lista todos os usuários (endpoint `GET /api/users/`, requer role admin)
- AdminPage acessível apenas via `AdminRoute`
- NotFoundPage para rotas inválidas

## Spec
ProfilePage é basicamente o formulário de onboarding pré-preenchido com os dados atuais do usuário. AdminPage exibe uma tabela com todos os usuários (nome, email, idiomas, role, data de cadastro).

**Visual ProfilePage:**
- Layout com avatar grande editável, campos organizados em seções
- Botão salvar em `#219ebc`

**Visual AdminPage:**
- Tabela com shadcn/ui Table component
- Badge de role: admin em `#fb8500`, user em `#8ecae6`
- Filtro de busca por nome/email

## Tasks
- [ ] Criar `src/pages/ProfilePage.jsx` — form pré-preenchido com dados do usuário, mutation de update
- [ ] Criar `src/pages/AdminPage.jsx` — tabela de usuários com query `GET /api/users/`
- [ ] Criar `src/pages/NotFoundPage.jsx` — 404 com link para `/home`
- [ ] Adicionar link "Admin" na sidebar apenas para usuários com role admin
- [ ] Adicionar link "Perfil" na sidebar para todos os usuários autenticados
