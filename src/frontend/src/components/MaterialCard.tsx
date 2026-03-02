import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Download, File, FileText, Image, Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";
import type { StudyMaterialPublic, Subject } from "../backend";
import { SAMPLE_SUBJECTS } from "../data/sampleData";

interface MaterialCardProps {
  material: StudyMaterialPublic;
  subjects?: Subject[];
  index?: number;
}

function getSubjectName(subjectId: string, subjects?: Subject[]): string {
  const list = subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;
  return list.find((s) => s.id === subjectId)?.name ?? subjectId;
}

function getContentIcon(contentType: string) {
  switch (contentType.toLowerCase()) {
    case "pdf":
      return <FileText className="w-4 h-4" />;
    case "image":
      return <Image className="w-4 h-4" />;
    default:
      return <File className="w-4 h-4" />;
  }
}

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MaterialCard({
  material,
  subjects,
  index = 0,
}: MaterialCardProps) {
  const subjectName = getSubjectName(material.subjectId, subjects);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to="/material/$id"
        params={{ id: material.id }}
        className="block group h-full"
      >
        <article className="h-full bg-card border border-border rounded-xl p-5 card-hover flex flex-col gap-3 shadow-card">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  material.isPremium ? "badge-premium" : "badge-free"
                }`}
              >
                {material.isPremium ? (
                  <>
                    <Lock className="w-3 h-3" /> PREMIUM
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" /> FREE
                  </>
                )}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {getContentIcon(material.contentType)}
              {material.contentType.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-base leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {material.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {material.description}
          </p>

          {/* Tags */}
          {material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {material.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {material.tags.length > 4 && (
                <span className="text-xs text-muted-foreground py-0.5">
                  +{material.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 mt-auto">
            <Badge
              variant="outline"
              className="text-xs font-normal text-muted-foreground"
            >
              {subjectName}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3.5 h-3.5" />
              {material.downloadCount.toString()} downloads
            </div>
          </div>

          {/* Upload date */}
          <p className="text-xs text-muted-foreground/70">
            Added {formatDate(material.createdAt)}
          </p>
        </article>
      </Link>
    </motion.div>
  );
}
