import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid refetching on focus
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
    },
  },
});

export default queryClient;
