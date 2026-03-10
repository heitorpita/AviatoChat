# 17 — Tradução Inline de Mensagens
**Data:** 2026-03-10

## Requirements
- Botão "Traduzir" em mensagens recebidas
- Traduz para o idioma nativo do usuário logado
- Mostra tradução abaixo do texto original (toggleável)
- API gratuita sem necessidade de chave (MyMemory)

## Spec

### Serviço de Tradução
Usar **MyMemory API** (gratuita, sem chave para uso básico):
```
GET https://api.mymemory.translated.net/get?q=texto&langpair=en|pt
```

**Mapeamento de idiomas do app → códigos ISO:**
```js
const LANG_CODES = {
  "English": "en",
  "Portuguese": "pt",
  "Spanish": "es",
  "French": "fr",
  "German": "de",
  "Italian": "it",
  "Japanese": "ja",
  "Korean": "ko",
  "Chinese": "zh",
  // ...
};
```

### Frontend — `ChatPage.jsx`

**Estado por mensagem:**
```js
const [translations, setTranslations] = useState({}); // { messageId: string }
const [loadingTranslations, setLoadingTranslations] = useState({}); // { messageId: bool }
```

**Função de tradução:**
```js
const translateMessage = async (messageId, text) => {
  setLoadingTranslations(prev => ({ ...prev, [messageId]: true }));
  const langpair = `${LANG_CODES[friendNativeLanguage]}|${LANG_CODES[user.nativeLanguage]}`;
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`);
  const data = await res.json();
  setTranslations(prev => ({ ...prev, [messageId]: data.responseData.translatedText }));
  setLoadingTranslations(prev => ({ ...prev, [messageId]: false }));
};
```

**Botão e exibição:**
```jsx
{/* Apenas em mensagens recebidas */}
{msg.senderId !== user.id && msg.text && (
  <div>
    <p>{msg.text}</p>
    {translations[msg.id] && (
      <p className="text-xs text-gray-500 mt-1 italic border-t border-gray-200 pt-1">
        {translations[msg.id]}
      </p>
    )}
    <button
      className="text-xs text-brand-teal mt-1 hover:underline"
      onClick={() => translations[msg.id]
        ? setTranslations(prev => { const n = {...prev}; delete n[msg.id]; return n; })
        : translateMessage(msg.id, msg.text)
      }
    >
      {loadingTranslations[msg.id] ? "..." : translations[msg.id] ? "Ocultar tradução" : "Traduzir"}
    </button>
  </div>
)}
```

## Arquivos a Modificar
- `frontend/src/pages/ChatPage.jsx` — estado de traduções + botão + display

## Notas
- Sem mudanças no backend
- MyMemory limita ~1000 req/dia por IP; para produção considerar LibreTranslate self-hosted
- Não armazenar traduções no banco (efêmeras, só no estado da sessão)
