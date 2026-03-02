import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CreditCard,
  Download,
  ExternalLink,
  File,
  FileText,
  Image,
  Loader2,
  Lock,
  Tag,
  Unlock,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { SAMPLE_SUBJECTS } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useGetMaterial,
  useGetMaterialBlobId,
  useGetSubjects,
  useHasPurchased,
  useIncrementDownload,
} from "../hooks/useQueries";

function getSubjectName(
  subjectId: string,
  subjects?: { id: string; name: string }[],
): string {
  const list = subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;
  return list.find((s) => s.id === subjectId)?.name ?? subjectId;
}

function getContentIcon(contentType: string, size = "w-5 h-5") {
  switch (contentType.toLowerCase()) {
    case "pdf":
      return <FileText className={size} />;
    case "image":
      return <Image className={size} />;
    default:
      return <File className={size} />;
  }
}

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MaterialDetailPage() {
  const { id } = useParams({ from: "/material/$id" });
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: material, isLoading } = useGetMaterial(id);
  const { data: subjects } = useGetSubjects();
  const { data: hasPurchased, isLoading: checkingPurchase } =
    useHasPurchased(id);
  const { data: blob } = useGetMaterialBlobId(
    id,
    !!material && (!material.isPremium || !!hasPurchased),
  );
  const incrementDownload = useIncrementDownload();
  const createCheckout = useCreateCheckoutSession();

  const canAccess = material && (!material.isPremium || hasPurchased);

  const handleDownload = async () => {
    if (!blob) {
      toast.error("File not available yet. Please try again.");
      return;
    }
    try {
      const url = blob.getDirectURL();
      window.open(url, "_blank", "noopener");
      incrementDownload.mutate(id);
    } catch {
      toast.error("Failed to open file. Please try again.");
    }
  };

  const handleBuyAccess = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase premium materials.");
      return;
    }
    if (!material) return;

    try {
      // Store materialId for use after redirect
      localStorage.setItem("pendingPurchaseMaterialId", material.id);

      const session = await createCheckout.mutateAsync([
        {
          productName: material.title,
          currency: "usd",
          quantity: BigInt(1),
          priceInCents: BigInt(499),
          productDescription: material.description.slice(0, 200),
        },
      ]);

      window.location.href = session.url;
    } catch (err) {
      toast.error("Failed to initiate checkout. Please try again.");
      console.error(err);
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (!material) {
    return (
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          Material not found
        </h2>
        <p className="text-muted-foreground mb-6">
          This study material may have been removed.
        </p>
        <Link to="/">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </Link>
      </main>
    );
  }

  const subjectName = getSubjectName(material.subjectId, subjects);

  return (
    <main className="flex-1 container max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Badge + Type */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                material.isPremium ? "badge-premium" : "badge-free"
              }`}
            >
              {material.isPremium ? (
                <>
                  <Lock className="w-3.5 h-3.5" /> PREMIUM
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" /> FREE
                </>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              {getContentIcon(material.contentType, "w-4 h-4")}
              {material.contentType.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-snug mb-4">
            {material.title}
          </h1>

          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              About this material
            </h2>
            <p className="text-foreground leading-relaxed">
              {material.description}
            </p>
          </div>

          {/* Tags */}
          {material.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Tag className="w-4 h-4" />
                <span className="font-medium">Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {material.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetaItem
              icon={<BookOpen className="w-4 h-4" />}
              label="Subject"
              value={subjectName}
            />
            <MetaItem
              icon={<Calendar className="w-4 h-4" />}
              label="Uploaded"
              value={formatDate(material.createdAt)}
            />
            <MetaItem
              icon={<Download className="w-4 h-4" />}
              label="Downloads"
              value={material.downloadCount.toString()}
            />
          </div>
        </div>

        {/* Sidebar: Access Panel */}
        <div className="lg:col-span-1">
          <div
            className={`sticky top-24 rounded-xl border p-6 ${
              material.isPremium && !hasPurchased
                ? "bg-gradient-to-b from-card to-accent/5 border-accent/30"
                : "bg-card border-border"
            }`}
          >
            {material.isPremium && !hasPurchased && !checkingPurchase ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mx-auto mb-4">
                  <Lock className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-center mb-2">
                  Premium Content
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-5">
                  Get lifetime access to this premium study material for a
                  one-time payment.
                </p>
                <div className="text-center mb-5">
                  <span className="text-3xl font-display font-bold text-foreground">
                    $4.99
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    one-time
                  </span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  {[
                    "Permanent access",
                    "Download any time",
                    "High quality PDF",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full gap-2"
                  onClick={handleBuyAccess}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Buy Premium Access
                    </>
                  )}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Sign in required to purchase
                  </p>
                )}
              </>
            ) : canAccess ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4">
                  <Unlock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-center mb-2">
                  {material.isPremium ? "Access Unlocked" : "Free Resource"}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-5">
                  {material.isPremium
                    ? "You have premium access. Download or view this material."
                    : "This material is free for everyone. Download or view it now."}
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={handleDownload}
                  disabled={!blob}
                >
                  {!blob ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading file…
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" /> View / Download
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-foreground truncate">
        {value}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="flex-1 container max-w-4xl mx-auto px-4 py-10">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
