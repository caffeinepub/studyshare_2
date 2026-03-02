import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { CheckCircle, File, Loader2, Plus, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { SAMPLE_SUBJECTS } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetSubjects,
  useIsCallerAdmin,
  useUploadMaterial,
} from "../hooks/useQueries";

export default function UploadPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: subjects } = useGetSubjects();
  const uploadMaterial = useUploadMaterial();

  const subjectList =
    subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [contentType, setContentType] = useState<"pdf" | "doc" | "image">(
    "pdf",
  );
  const [tagsInput, setTagsInput] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!identity) {
    return (
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">
          Sign In Required
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to sign in to upload study materials.
        </p>
        <Link to="/">
          <Button>Go to Browse</Button>
        </Link>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">
          Admin Access Required
        </h2>
        <p className="text-muted-foreground mb-6">
          Only administrators can upload study materials.
        </p>
        <Link to="/">
          <Button>Go to Browse</Button>
        </Link>
      </main>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect content type
      if (file.type.includes("pdf")) setContentType("pdf");
      else if (file.type.startsWith("image/")) setContentType("image");
      else setContentType("doc");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.includes("pdf")) setContentType("pdf");
      else if (file.type.startsWith("image/")) setContentType("image");
      else setContentType("doc");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");
    if (!description.trim()) return toast.error("Description is required");
    if (!subjectId) return toast.error("Please select a subject");
    if (!selectedFile) return toast.error("Please select a file to upload");
    if (!identity) return toast.error("Not authenticated");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to bytes
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());

      // Create blob with progress tracking
      const blobWithProgress = ExternalBlob.fromBytes(bytes).withUploadProgress(
        (pct) => {
          setUploadProgress(pct);
        },
      );

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await uploadMaterial.mutateAsync({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        subjectId,
        contentType,
        tags,
        isPremium,
        blobId: blobWithProgress,
        uploader: identity.getPrincipal(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        downloadCount: BigInt(0),
      });

      setSuccess(true);
      toast.success("Material uploaded successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setSubjectId("");
      setTagsInput("");
      setIsPremium(false);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex-1 container max-w-2xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Upload Study Material
          </h1>
          <p className="text-muted-foreground">
            Share your notes and study guides with students worldwide.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Calculus Complete Guide: Limits to Integration"
              className="bg-card"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this material covers and who it's for…"
              rows={4}
              className="bg-card resize-none"
            />
          </div>

          {/* Subject + Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Subject <span className="text-destructive">*</span>
              </Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v) =>
                  setContentType(v as "pdf" | "doc" | "image")
                }
              >
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="doc">Word Doc / Notes</SelectItem>
                  <SelectItem value="image">Image / Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="calculus, derivatives, exam-prep (comma separated)"
              className="bg-card"
            />
            {tagsInput.trim() && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => {
                          const tags = tagsInput
                            .split(",")
                            .filter((t) => t.trim() !== tag);
                          setTagsInput(tags.join(","));
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div>
              <div className="font-medium text-sm">Premium Content</div>
              <div className="text-xs text-muted-foreground">
                Students pay $4.99 for access
              </div>
            </div>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              File <span className="text-destructive">*</span>
            </Label>
            <label
              htmlFor="file-upload"
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors block ${
                selectedFile
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto p-1 hover:bg-muted rounded-md transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, TXT, PNG, JPG up to 50MB
                  </p>
                </div>
              )}
            </label>

            {/* Progress bar */}
            {isUploading && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Uploading (
                {uploadProgress}%)…
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" /> Uploaded Successfully!
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Upload Material
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
