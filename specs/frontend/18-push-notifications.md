# 18 — Notificações Push (PWA)
**Data:** 2026-03-10

## Requirements
- Notificar usuário de nova mensagem quando a aba está em background/fechada
- Solicitar permissão ao primeiro login
- Clicar na notificação abre o chat com o remetente
- Configurável: usuário pode desativar

## Spec

### Backend
**Instalar:** `npm install web-push`

**Configuração VAPID:**
```js
import webpush from "web-push";
webpush.setVapidDetails("mailto:admin@aviatochat.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
```

**Armazenar subscription:**
```prisma
model PushSubscription {
  id           String @id @default(cuid())
  userId       String
  endpoint     String @unique
  p256dh       String
  auth         String
  createdAt    DateTime @default(now())
  user         User @relation(...)
}
```

**Endpoint:** `POST /api/push/subscribe` — salva subscription
**Disparar notificação:** no socket handler de nova mensagem, buscar subscriptions do destinatário e enviar via `webpush.sendNotification()`

### Frontend

**`public/sw.js`** — Service Worker:
```js
self.addEventListener("push", event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/logo.png",
    data: { url: data.url },
  });
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  clients.openWindow(event.notification.data.url);
});
```

**Registrar SW e solicitar permissão:**
```js
// Em useEffect após login
if ("serviceWorker" in navigator && "PushManager" in window) {
  const reg = await navigator.serviceWorker.register("/sw.js");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });
    await axiosInstance.post("/push/subscribe", sub);
  }
}
```

## Arquivos a Criar/Modificar
- `backend/prisma/schema.prisma` — model PushSubscription
- `backend/src/routes/push.routes.js` — endpoint subscribe
- `backend/src/lib/socket.js` — disparar push ao receber mensagem
- `frontend/public/sw.js` — service worker
- `frontend/src/App.jsx` ou `useAuth.js` — registrar SW após login

## Notas
- Requer HTTPS em produção (localhost funciona para dev)
- Gerar VAPID keys: `npx web-push generate-vapid-keys`
- Complexidade moderada; implementar após 09–16
