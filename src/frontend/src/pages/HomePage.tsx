import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ChevronDown, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { StudyMaterialPublic } from "../backend";
import MaterialCard from "../components/MaterialCard";
import MaterialCardSkeleton from "../components/MaterialCardSkeleton";
import { SAMPLE_MATERIALS, SAMPLE_SUBJECTS } from "../data/sampleData";
import {
  useGetSubjects,
  useListMaterials,
  useSearchMaterials,
} from "../hooks/useQueries";

type FilterTab = "all" | "free" | "premium";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const debouncedSearch = useDebounce(searchInput, 350);
  const isSearching = debouncedSearch.trim().length > 0;

  const { data: allMaterials, isLoading: loadingMaterials } =
    useListMaterials(true);
  const { data: searchResults, isLoading: loadingSearch } =
    useSearchMaterials(debouncedSearch);
  const { data: subjects } = useGetSubjects();

  const subjectList =
    subjects && subjects.length > 0 ? subjects : SAMPLE_SUBJECTS;

  const baseMaterials: StudyMaterialPublic[] = useMemo(() => {
    if (isSearching) return searchResults ?? [];
    if (allMaterials && allMaterials.length > 0) return allMaterials;
    return SAMPLE_MATERIALS;
  }, [isSearching, searchResults, allMaterials]);

  const filtered = useMemo(() => {
    return baseMaterials.filter((m) => {
      const matchesTab =
        filterTab === "all" ||
        (filterTab === "free" && !m.isPremium) ||
        (filterTab === "premium" && m.isPremium);
      const matchesSubject =
        selectedSubject === "all" || m.subjectId === selectedSubject;
      return matchesTab && matchesSubject;
    });
  }, [baseMaterials, filterTab, selectedSubject]);

  const isLoading = isSearching ? loadingSearch : loadingMaterials;

  const stats = useMemo(() => {
    const src =
      allMaterials && allMaterials.length > 0 ? allMaterials : SAMPLE_MATERIALS;
    return {
      total: src.length,
      free: src.filter((m) => !m.isPremium).length,
      premium: src.filter((m) => m.isPremium).length,
    };
  }, [allMaterials]);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-card border-b border-border">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/assets/generated/hero-studyshare.dim_1200x400.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 texture-paper" />

        <div className="relative container max-w-7xl mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Free &amp; Premium Study Resources
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
              Learn Together,{" "}
              <span className="text-primary italic">Share Knowledge</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              You can access{" "}
              <span className="text-blue-400 font-semibold">CLASS 10th</span>{" "}
              and <span className="text-blue-400 font-semibold">11th</span>{" "}
              <span className="text-emerald-400 font-semibold">CBSE</span>{" "}
              <span className="text-muted-foreground">AND</span>{" "}
              <span className="text-orange-400 font-semibold">JEE</span> pure
              content notes here uploaded here by previous students and some
              extra content into premium category like{" "}
              <span className="text-yellow-400 font-semibold">SHORT NOTES</span>
              ,{" "}
              <span className="text-pink-400 font-semibold">
                DEEP EXPLAINED THEORY
              </span>{" "}
              notes and{" "}
              <span className="text-purple-400 font-semibold">cheat notes</span>{" "}
              <span className="text-red-400 font-semibold">SAMPLE PAPERS</span>,{" "}
              <span className="text-cyan-400 font-semibold">MOCK TESTS</span>{" "}
              and many more.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search materials, subjects, topics…"
                className="pl-12 h-13 text-base bg-card/80 backdrop-blur border-border focus-visible:ring-primary"
              />
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-8 mt-10"
          >
            {[
              { label: "Total Materials", value: stats.total },
              { label: "Free Resources", value: stats.free },
              { label: "Premium Guides", value: stats.premium },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-display font-bold text-foreground">
                  {stat.value}+
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Browse Section */}
      <section className="container max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs
              value={filterTab}
              onValueChange={(v) => setFilterTab(v as FilterTab)}
            >
              <TabsList className="bg-muted/60">
                <TabsTrigger value="all" className="text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="free" className="text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-free-badge" />
                    Free
                  </span>
                </TabsTrigger>
                <TabsTrigger value="premium" className="text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-premium-badge" />
                    Premium
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-44 bg-card">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="All Subjects" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjectList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <MaterialCardSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            search={debouncedSearch}
            onClear={() => {
              setSearchInput("");
              setFilterTab("all");
              setSelectedSubject("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((material, i) => (
              <MaterialCard
                key={material.id}
                material={material}
                subjects={subjectList}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Load more indicator (visual only) */}
        {!isLoading && filtered.length > 6 && (
          <div className="text-center mt-10">
            <Button variant="outline" className="gap-2">
              <ChevronDown className="w-4 h-4" />
              Showing all {filtered.length} results
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState({
  search,
  onClear,
}: { search: string; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        {search ? `No results for "${search}"` : "No materials found"}
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-5">
        {search
          ? "Try different keywords or clear the filters to browse all materials."
          : "No study materials match the current filters. Try adjusting your selection."}
      </p>
      <Button onClick={onClear} variant="outline" size="sm">
        Clear filters
      </Button>
    </motion.div>
  );
}
