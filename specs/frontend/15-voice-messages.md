# 15 — Mensagens de Voz
**Data:** 2026-03-10

## Requirements
- Segurar botão de microfone para gravar áudio
- Preview antes de enviar (player com duração)
- Upload do áudio e envio como mensagem
- Reproduzir mensagens de voz no chat

## Spec

### Backend — Prisma
```prisma
model Message {
  // ...campos existentes...
  audioUrl  String?  // ← novo
}
```

### Backend — Upload
Reutilizar o endpoint `POST /api/upload` da spec 11.
Atualizar o `fileFilter` do multer para aceitar `audio/webm`, `audio/ogg`, `audio/mpeg`.

### Frontend — Gravação
```js
// MediaRecorder API
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    setAudioBlob(blob);
    setAudioPreview(URL.createObjectURL(blob));
  };
  recorder.start();
  setMediaRecorder(recorder);
};

const stopRecording = () => mediaRecorder.stop();
```

**Botão (press & hold):**
```jsx
<button
  onMouseDown={startRecording}
  onMouseUp={stopRecording}
  onTouchStart={startRecording}
  onTouchEnd={stopRecording}
  className={`rounded-full p-2 ${isRecording ? "bg-red-500 text-white" : "text-brand-teal"}`}
>
  <MicIcon />
</button>
```

**Preview antes de enviar:**
```jsx
{audioPreview && (
  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
    <audio src={audioPreview} controls className="h-8" />
    <button onClick={sendAudio}>Enviar</button>
    <button onClick={() => setAudioPreview(null)}>✕</button>
  </div>
)}
```

**Render no chat:**
```jsx
{msg.audioUrl && (
  <audio src={msg.audioUrl} controls className="max-w-xs rounded-lg" />
)}
```

## Arquivos a Modificar
- `backend/prisma/schema.prisma` — campo audioUrl
- `backend/src/middleware/upload.js` — aceitar tipos de áudio
- `backend/src/lib/socket.js` — salvar audioUrl
- `frontend/src/pages/ChatPage.jsx` — gravação, preview, render
