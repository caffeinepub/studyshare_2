import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { AlertCircle, BookOpen, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetStripeSessionStatus,
  useRecordPurchase,
} from "../hooks/useQueries";

export default function PaymentSuccessPage() {
  const search = useSearch({ from: "/payment/success" });
  const sessionId = (search as Record<string, string>).session_id ?? "";
  const { identity } = useInternetIdentity();
  const {
    data: sessionStatus,
    isLoading,
    error,
  } = useGetStripeSessionStatus(sessionId);
  const recordPurchase = useRecordPurchase();
  const hasRecorded = useRef(false);

  const materialId = localStorage.getItem("pendingPurchaseMaterialId") ?? "";

  useEffect(() => {
    if (
      !hasRecorded.current &&
      sessionStatus?.__kind__ === "completed" &&
      identity &&
      materialId &&
      sessionId
    ) {
      hasRecorded.current = true;
      localStorage.removeItem("pendingPurchaseMaterialId");

      recordPurchase
        .mutateAsync({
          userId: identity.getPrincipal(),
          materialId,
          stripeSessionId: sessionId,
          purchasedAt: BigInt(Date.now()) * BigInt(1_000_000),
        })
        .then(() => {
          toast.success("Purchase recorded! You can now access your material.");
        })
        .catch(() => {
          toast.error("Failed to record purchase. Please contact support.");
        });
    }
  }, [sessionStatus, identity, materialId, sessionId, recordPurchase]);

  if (!sessionId) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Invalid Session
          </h2>
          <p className="text-muted-foreground mb-5">
            No payment session found.
          </p>
          <Link to="/">
            <Button>Browse Materials</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment…</p>
        </div>
      </main>
    );
  }

  if (error || sessionStatus?.__kind__ === "failed") {
    const errorMsg =
      sessionStatus?.__kind__ === "failed"
        ? sessionStatus.failed.error
        : "Payment verification failed";
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Payment Failed
          </h2>
          <p className="text-muted-foreground mb-2">{errorMsg}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Please contact support if you were charged.
          </p>
          <Link to="/">
            <Button variant="outline">Return to Browse</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 200,
            delay: 0.1,
          }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold mb-3">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-2">
          Your premium material is now unlocked.
        </p>
        {recordPurchase.isPending && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Recording purchase…
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          {materialId && (
            <Link to="/material/$id" params={{ id: materialId }}>
              <Button className="gap-2 w-full sm:w-auto">
                <BookOpen className="w-4 h-4" />
                View Material
              </Button>
            </Link>
          )}
          <Link to="/dashboard">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              My Library
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
