import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle,
  CreditCard,
  Eye,
  Loader2,
  Lock,
  Plus,
  Settings,
  Trash2,
  Unlock,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { SAMPLE_SUBJECTS } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddSubject,
  useDeleteMaterial,
  useGetSubjects,
  useIsCallerAdmin,
  useIsStripeConfigured,
  useListMaterials,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();

  if (!identity) {
    return (
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">
          Sign In Required
        </h2>
        <p className="text-muted-foreground mb-6">
          Admin access requires authentication.
        </p>
        <Link to="/">
          <Button>Go to Browse</Button>
        </Link>
      </main>
    );
  }

  if (checkingAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You do not have administrator privileges.
        </p>
        <Link to="/">
          <Button>Go to Browse</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 container max-w-5xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage materials, subjects, and configuration
            </p>
          </div>
        </div>

        <Tabs defaultValue="materials">
          <TabsList className="mb-6">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="stripe">Stripe Config</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <MaterialsManagement />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectsManagement />
          </TabsContent>

          <TabsContent value="stripe">
            <StripeConfiguration />
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}

// ── Materials Tab ─────────────────────────────────────────────────────────

function MaterialsManagement() {
  const { data: materials, isLoading } = useListMaterials(true);
  const deleteMaterial = useDeleteMaterial();
  const { data: subjects } = useGetSubjects();
  const subjectList =
    subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {["sk1", "sk2", "sk3", "sk4"].map((k) => (
          <div key={k} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BookOpen className="w-10 h-10 mx-auto mb-3" />
        <p>No materials uploaded yet.</p>
        <Link to="/upload">
          <Button size="sm" className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Upload First Material
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {materials.length} total materials
        </p>
        <Link to="/upload">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Upload New
          </Button>
        </Link>
      </div>

      {materials.map((material) => {
        const subject = subjectList.find((s) => s.id === material.subjectId);
        return (
          <div
            key={material.id}
            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl group hover:border-border/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  material.isPremium ? "bg-accent/10" : "bg-primary/10"
                }`}
              >
                {material.isPremium ? (
                  <Lock className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <Unlock className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {material.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs py-0">
                    {subject?.name ?? material.subjectId}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {material.downloadCount.toString()} downloads
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <Link to="/material/$id" params={{ id: material.id }}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Material</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &ldquo;{material.title}
                      &rdquo;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        try {
                          await deleteMaterial.mutateAsync(material.id);
                          toast.success("Material deleted");
                        } catch {
                          toast.error("Failed to delete material");
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Subjects Tab ──────────────────────────────────────────────────────────

function SubjectsManagement() {
  const { data: subjects } = useGetSubjects();
  const addSubject = useAddSubject();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saved, setSaved] = useState(false);

  const subjectList =
    subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Subject name is required");
    try {
      await addSubject.mutateAsync({
        id: name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        name: name.trim(),
        description: desc.trim(),
      });
      setName("");
      setDesc("");
      setSaved(true);
      toast.success("Subject added successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to add subject");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add Subject Form */}
      <div>
        <h2 className="font-semibold mb-4">Add New Subject</h2>
        <form
          onSubmit={handleAdd}
          className="space-y-4 bg-card border border-border rounded-xl p-5"
        >
          <div className="space-y-2">
            <Label htmlFor="subjectName">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subjectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Biochemistry"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectDesc">Description</Label>
            <Textarea
              id="subjectDesc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description of the subject"
              rows={3}
              className="bg-background resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={addSubject.isPending}
          >
            {addSubject.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Added!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Subject
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Subject List */}
      <div>
        <h2 className="font-semibold mb-4">
          Current Subjects ({subjectList.length})
        </h2>
        <div className="space-y-2">
          {subjectList.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
            >
              <div>
                <div className="text-sm font-medium">{subject.name}</div>
                {subject.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {subject.description}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {subject.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stripe Tab ────────────────────────────────────────────────────────────

function StripeConfiguration() {
  const { data: isConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState("");
  const [countriesInput, setCountriesInput] = useState(
    "US, CA, GB, AU, DE, FR, IN, JP",
  );
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) return toast.error("Stripe secret key is required");
    const allowedCountries = countriesInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (allowedCountries.length === 0)
      return toast.error("At least one country is required");

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      setSaved(true);
      setSecretKey("");
      toast.success("Stripe configured successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save Stripe configuration");
    }
  };

  return (
    <div className="max-w-lg">
      <div
        className={`p-4 rounded-xl mb-6 border flex items-center gap-3 ${
          isConfigured
            ? "bg-primary/5 border-primary/20 text-primary"
            : "bg-muted border-border text-muted-foreground"
        }`}
      >
        <CreditCard className="w-5 h-5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-medium">Stripe: </span>
          {isConfigured ? "Configured and active" : "Not yet configured"}
        </div>
      </div>

      <h2 className="font-semibold mb-4">
        {isConfigured
          ? "Update Stripe Configuration"
          : "Set Up Stripe Payments"}
      </h2>

      <form
        onSubmit={handleSave}
        className="space-y-4 bg-card border border-border rounded-xl p-5"
      >
        <div className="space-y-2">
          <Label htmlFor="stripeKey">
            Stripe Secret Key <span className="text-destructive">*</span>
          </Label>
          <Input
            id="stripeKey"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="sk_live_…"
            className="bg-background font-mono"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Your Stripe secret key (starts with sk_live_ or sk_test_). Never
            share this publicly.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="countries">Allowed Countries</Label>
          <Input
            id="countries"
            value={countriesInput}
            onChange={(e) => setCountriesInput(e.target.value)}
            placeholder="US, CA, GB, AU, DE"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated ISO country codes where payments are accepted.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={setStripeConfig.isPending}
        >
          {setStripeConfig.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" /> Save Configuration
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
