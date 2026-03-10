# 16 — Busca de Usuários
**Data:** 2026-03-10

## Requirements
- Campo de busca na HomePage para encontrar usuários por nome ou idioma
- Resultados aparecem em tempo real (debounce 300ms)
- Busca funciona independente do filtro de matching
- Pode adicionar como amigo direto dos resultados

## Spec

### Backend
**Novo endpoint:** `GET /api/users/search?q=texto`
```js
const users = await prisma.user.findMany({
  where: {
    id: { not: userId },
    isOnboarded: true,
    friends: { none: { id: userId } },
    OR: [
      { fullName: { contains: q, mode: "insensitive" } },
      { nativeLanguage: { contains: q, mode: "insensitive" } },
      { learningLanguage: { contains: q, mode: "insensitive" } },
    ],
  },
  take: 10,
  select: { id, fullName, profilePic, nativeLanguage, learningLanguage, location },
});
```

### Frontend — HomePage
```jsx
const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 300);

const { data: searchResults } = useQuery({
  queryKey: ["user-search", debouncedQuery],
  queryFn: () => searchUsers(debouncedQuery),
  enabled: debouncedQuery.length >= 2,
});

// Exibir resultados de busca quando há query, senão mostrar sugestões normais
const displayedUsers = debouncedQuery.length >= 2 ? searchResults : suggestedUsers;
```

**Input de busca:**
```jsx
<div className="relative mb-6">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
  <input
    type="text"
    placeholder="Buscar por nome ou idioma..."
    className="w-full pl-10 pr-4 py-2 border border-brand-sky rounded-full focus:outline-none focus:border-brand-teal"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
  />
  {searchQuery && (
    <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}>✕</button>
  )}
</div>
```

## Arquivos a Modificar
- `backend/src/modules/user/controllers/user.controller.js` — endpoint search
- `backend/src/routes/user.routes.js` — registrar rota
- `frontend/src/pages/HomePage.jsx` — input de busca + query
- `frontend/src/lib/api.js` — função `searchUsers`
