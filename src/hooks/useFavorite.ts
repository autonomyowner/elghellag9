import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useConvexAuth } from "./useCurrentUser";

export function useFavorite(listingId: Id<"listings">) {
  const { isAuthenticated } = useConvexAuth();
  const isFavorited = useQuery(
    api.favorites.isFavorited,
    isAuthenticated ? { listingId } : "skip"
  );
  const toggle = useMutation(api.favorites.toggle);

  return {
    isFavorited: isFavorited ?? false,
    toggle: () => toggle({ listingId }),
    isLoading: isFavorited === undefined,
  };
}
