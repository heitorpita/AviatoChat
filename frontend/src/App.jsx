import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppRouter } from './router/AppRouter'
import { IncomingCallModal } from './components/IncomingCallModal'
import { useSocket } from './hooks/useSocket'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function SocketInit() {
  useSocket()
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketInit />
        <IncomingCallModal />
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#023047',
              color: '#8ecae6',
              border: '1px solid #219ebc44',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#ffb703', secondary: '#023047' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
