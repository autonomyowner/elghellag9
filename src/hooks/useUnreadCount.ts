import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "./useCurrentUser";

export function useUnreadCount() {
  const { isAuthenticated } = useConvexAuth();
  const count = useQuery(
    api.conversations.getUnreadTotal,
    isAuthenticated ? {} : "skip"
  );
  return count ?? 0;
}
