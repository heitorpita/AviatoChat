# 10 — Partner Matching Aberto (Sem Restrição de Idioma)
**Data:** 2026-03-10

## Requirements
- A tela Home deve sugerir todos os usuários cadastrados (onboarded) que ainda não são amigos
- Remover o filtro de cruzamento de idiomas (nativo ↔ aprendizado)
- Manter exibição de: nome, idioma nativo, idioma que aprende, localização, bio, status online
- Comportamento de "Adicionar" permanece igual

## Contexto
Atualmente o endpoint filtra apenas pares que fazem "tandem" exato:
- `nativeLanguage do A == learningLanguage do B` **E**
- `learningLanguage do A == nativeLanguage do B`

Com poucos usuários, isso faz com que a tela Home fique vazia para a maioria. A solução é exibir todos os usuários onboarded que ainda não são amigos, independente do idioma.

## Spec

### Backend — `user.controller.js`

**Endpoint:** `GET /api/users/chat-users`

**Antes:**
```js
where: {
  id: { not: minhaId },
  isOnboarded: true,
  friends: { none: { id: minhaId } },
  nativeLanguage: currentUser.learningLanguage,   // ← remover
  learningLanguage: currentUser.nativeLanguage,   // ← remover
}
```

**Depois:**
```js
where: {
  id: { not: minhaId },
  isOnboarded: true,
  friends: { none: { id: minhaId } },
  // sem filtro de idioma
}
```

**Opcional:** adicionar ordenação para mostrar parceiros "compatíveis" primeiro (match parcial de idioma) sem excluir os demais:
```js
// Se quiser manter a lógica de relevância sem excluir ninguém:
// buscar todos e ordenar no JS: compatíveis primeiro, resto depois
```

### Frontend
Nenhuma alteração necessária. `getChatUsers()` já renderiza os dados recebidos.

**Opcional — UI:** Adicionar badge "Parceiro ideal" nos cards onde o cruzamento de idiomas é exato (A aprende o idioma nativo de B e vice-versa), para dar contexto ao usuário sem excluir ninguém.

## Arquivos a Modificar
- `backend/src/modules/user/controllers/user.controller.js` — remover filtros de idioma no `findMany`

## Verificação
1. Criar dois usuários com idiomas não cruzados (ex: João: pt nativo, aprende en; Pedro: pt nativo, aprende es)
2. Antes da mudança: João não aparece para Pedro na Home
3. Após a mudança: João aparece para Pedro na Home
4. Usuários já amigos ainda não aparecem na lista
5. Usuários não-onboarded não aparecem na lista
