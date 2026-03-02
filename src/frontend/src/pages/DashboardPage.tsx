import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Download,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Lock,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { StudyMaterialPublic } from "../backend";
import { SAMPLE_SUBJECTS } from "../data/sampleData";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetMaterialBlobId,
  useGetSubjects,
  useGetUserPurchases,
  useIncrementDownload,
  useInitializeAdminAccess,
  useIsCallerAdmin,
} from "../hooks/useQueries";

function useGetMaterialForDownload(materialId: string) {
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

function PurchasedMaterialRow({
  materialId,
  subjects,
}: { materialId: string; subjects?: { id: string; name: string }[] }) {
  const { data: material } = useGetMaterialForDownload(materialId);
  const { data: blob } = useGetMaterialBlobId(materialId, true);
  const incrementDownload = useIncrementDownload();
  const subjectList =
    subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;

  const subjectName =
    subjectList.find((s) => s.id === material?.subjectId)?.name ??
    material?.subjectId ??
    "";

  const handleDownload = () => {
    if (!blob) {
      toast.error("File not available. Try again in a moment.");
      return;
    }
    window.open(blob.getDirectURL(), "_blank", "noopener");
    incrementDownload.mutate(materialId);
  };

  if (!material) {
    return (
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {material.title}
          </div>
          <div className="text-xs text-muted-foreground">{subjectName}</div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDownload}
        disabled={!blob}
        className="gap-1.5 flex-shrink-0 ml-4"
      >
        {!blob ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ExternalLink className="w-3.5 h-3.5" />
        )}
        Open
      </Button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isFetching: actorLoading } = useActor();
  const { data: purchases, isLoading } = useGetUserPurchases();
  const { data: subjects } = useGetSubjects();
  const { data: isAdmin } = useIsCallerAdmin();
  const claimAdmin = useInitializeAdminAccess();

  const handleClaimAdmin = async () => {
    try {
      await claimAdmin.mutateAsync();
      toast.success("🎉 Admin access granted! Reloading...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already been claimed")) {
        toast.error(
          "Admin access has already been claimed by another account. Only one admin is allowed.",
        );
      } else if (
        message.includes("still loading") ||
        message.includes("not available")
      ) {
        toast.error(
          "Still connecting to the network. Please wait a few seconds and try again.",
        );
      } else {
        toast.error(
          message ||
            "Failed to claim admin access. Please refresh and try again.",
        );
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-3">Your Library</h2>
        <p className="text-muted-foreground mb-6">
          Sign in to view your purchased premium materials and access history.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <LogIn className="w-4 h-4" />
            Go to Browse
          </Button>
        </Link>
      </main>
    );
  }

  const principalId = identity.getPrincipal().toString();
  const shortPrincipal = `${principalId.slice(0, 8)}…${principalId.slice(-4)}`;

  return (
    <main className="flex-1 container max-w-3xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">My Library</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                {shortPrincipal}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg text-sm font-medium text-accent-foreground">
            <Lock className="w-4 h-4" />
            {purchases?.length ?? 0} Premium
          </div>
        </div>

        {/* Admin Claim Card — shown when signed in but not yet admin */}
        {isAuthenticated && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8 p-5 rounded-xl border border-primary/40 bg-primary/5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-0.5">
                Set Up Admin Access
              </h3>
              <p className="text-sm text-muted-foreground">
                You are the first user. Click below to claim admin rights and
                unlock the Upload and Admin panel.
              </p>
            </div>
            <Button
              onClick={handleClaimAdmin}
              disabled={claimAdmin.isPending || actorLoading}
              className="gap-2 flex-shrink-0"
            >
              {claimAdmin.isPending || actorLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {claimAdmin.isPending
                ? "Claiming…"
                : actorLoading
                  ? "Connecting…"
                  : "Claim Admin Access"}
            </Button>
          </motion.div>
        )}

        {/* Purchases Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">
              Purchased Materials
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {["sk1", "sk2", "sk3"].map((k) => (
                <div
                  key={k}
                  className="h-16 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !purchases || purchases.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No purchases yet
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Browse premium materials and unlock deep-dive content for just
                $4.99 each.
              </p>
              <Link to="/">
                <Button size="sm" variant="outline">
                  Browse Premium Materials
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <PurchasedMaterialRow
                  key={purchase.materialId}
                  materialId={purchase.materialId}
                  subjects={subjects}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Browse CTA */}
        {purchases && purchases.length > 0 && (
          <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Looking for more resources?
              </div>
              <div className="text-xs text-muted-foreground">
                Browse free and premium study materials
              </div>
            </div>
            <Link to="/">
              <Button size="sm" variant="outline" className="gap-1.5">
                <BookOpen className="w-4 h-4" />
                Browse
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </main>
  );
}
