import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PurchaseRecord,
  ShoppingItem,
  StripeConfiguration,
  StudyMaterial,
  StudyMaterialPublic,
  Subject,
} from "../backend";
import { useActor } from "./useActor";

// ── Subjects ──────────────────────────────────────────────────────────────

export function useGetSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject: Subject) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSubject(subject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

// ── Materials ──────────────────────────────────────────────────────────────

export function useListMaterials(includePremium: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<StudyMaterialPublic[]>({
    queryKey: ["materials", includePremium],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMaterials(includePremium);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMaterial(materialId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudyMaterialPublic | null>({
    queryKey: ["material", materialId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMaterial(materialId);
    },
    enabled: !!actor && !isFetching && !!materialId,
  });
}

export function useSearchMaterials(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudyMaterialPublic[]>({
    queryKey: ["materials", "search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchMaterials(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useUploadMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (material: StudyMaterial) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadMaterial(material);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (materialId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMaterial(materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useIncrementDownload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (materialId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.incrementDownloadCount(materialId);
    },
    onSuccess: (_data, materialId) => {
      queryClient.invalidateQueries({ queryKey: ["material", materialId] });
    },
  });
}

export function useGetMaterialBlobId(materialId: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["material-blob", materialId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMaterialBlobId(materialId);
    },
    enabled: !!actor && !isFetching && enabled && !!materialId,
  });
}

// ── Admin ──────────────────────────────────────────────────────────────────

export function useInitializeAdminAccess() {
  const { actor: initialActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const actor = initialActor;
      if (!actor) {
        throw new Error(
          "Connection is still loading. Please wait a moment and try again.",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const success = await (actor as any).claimAdminIfFirst();
      if (!success) {
        throw new Error(
          "Admin access has already been claimed by another account.",
        );
      }
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
    retry: false,
  });
}

// ── Purchases ──────────────────────────────────────────────────────────────

export function useGetUserPurchases() {
  const { actor, isFetching } = useActor();
  return useQuery<PurchaseRecord[]>({
    queryKey: ["purchases"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserPurchases();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useHasPurchased(materialId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasPurchased", materialId],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.hasPurchased(materialId);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!materialId,
    retry: false,
  });
}

export function useRecordPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: PurchaseRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordPurchase(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["hasPurchased"] });
    },
  });
}

// ── Stripe ──────────────────────────────────────────────────────────────────

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/payment/cancel`;
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error("Stripe session missing url");
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripe-session", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: 2,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripeConfigured"] });
    },
  });
}
