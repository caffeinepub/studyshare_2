import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentCancelPage() {
  const materialId = localStorage.getItem("pendingPurchaseMaterialId");

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-3">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-6">
          No worries — your payment was not completed and you were not charged.
          You can try again anytime.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {materialId && (
            <Link to="/material/$id" params={{ id: materialId }}>
              <Button className="gap-2 w-full sm:w-auto">
                <BookOpen className="w-4 h-4" />
                Try Again
              </Button>
            </Link>
          )}
          <Link to="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Browse Materials
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
