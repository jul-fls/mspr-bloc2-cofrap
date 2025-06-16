import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/auth-context";
import { Home } from "./pages/home";

// Créer une instance de QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
