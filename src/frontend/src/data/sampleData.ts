import { Principal } from "@dfinity/principal";
import type { StudyMaterialPublic, Subject } from "../backend";

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    description: "Algebra, calculus, statistics and more",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Mechanics, electromagnetism, quantum theory",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Organic, inorganic, physical chemistry",
  },
  {
    id: "biology",
    name: "Biology",
    description: "Cell biology, genetics, ecology",
  },
  {
    id: "cs",
    name: "Computer Science",
    description: "Algorithms, data structures, programming",
  },
  {
    id: "history",
    name: "History",
    description: "World history, civilizations, modern history",
  },
  {
    id: "english",
    name: "English Literature",
    description: "Poetry, prose, literary analysis",
  },
];

const ANON_PRINCIPAL = Principal.anonymous();

export const SAMPLE_MATERIALS: StudyMaterialPublic[] = [
  {
    id: "sample-1",
    title: "Calculus Complete Guide: Limits to Integration",
    description:
      "A thorough 80-page guide covering differential and integral calculus, with step-by-step worked examples, common mistakes to avoid, and practice problem sets for exam prep.",
    contentType: "pdf",
    isPremium: false,
    subjectId: "math",
    tags: ["calculus", "derivatives", "integration", "exam-prep"],
    createdAt: BigInt(Date.now() - 7 * 24 * 3600 * 1000) * BigInt(1_000_000),
    uploader: ANON_PRINCIPAL,
    downloadCount: BigInt(247),
  },
  {
    id: "sample-2",
    title: "Quantum Mechanics: The Definitive Notes",
    description:
      "Premium comprehensive notes on quantum mechanics, covering wave functions, Schrödinger equation, quantum tunneling, and measurement theory with full derivations.",
    contentType: "pdf",
    isPremium: true,
    subjectId: "physics",
    tags: ["quantum", "wave-function", "advanced", "university"],
    createdAt: BigInt(Date.now() - 14 * 24 * 3600 * 1000) * BigInt(1_000_000),
    uploader: ANON_PRINCIPAL,
    downloadCount: BigInt(89),
  },
  {
    id: "sample-3",
    title: "Python Data Structures & Algorithms",
    description:
      "Clear and concise notes on common data structures (arrays, linked lists, trees, graphs) and algorithms with Python implementations. Includes Big-O analysis.",
    contentType: "pdf",
    isPremium: false,
    subjectId: "cs",
    tags: ["python", "algorithms", "data-structures", "coding-interview"],
    createdAt: BigInt(Date.now() - 3 * 24 * 3600 * 1000) * BigInt(1_000_000),
    uploader: ANON_PRINCIPAL,
    downloadCount: BigInt(512),
  },
  {
    id: "sample-4",
    title: "Organic Chemistry Reaction Mechanisms",
    description:
      "Premium study guide with 120+ organic chemistry reaction mechanisms, reagent tables, and mnemonic devices. Perfect for MCAT and advanced chemistry courses.",
    contentType: "pdf",
    isPremium: true,
    subjectId: "chemistry",
    tags: ["organic-chem", "reactions", "MCAT", "mechanisms"],
    createdAt: BigInt(Date.now() - 21 * 24 * 3600 * 1000) * BigInt(1_000_000),
    uploader: ANON_PRINCIPAL,
    downloadCount: BigInt(178),
  },
  {
    id: "sample-5",
    title: "Cell Biology & Molecular Genetics Summary",
    description:
      "Condensed notes on cell biology covering cell cycle, DNA replication, transcription, translation, and gene regulation. Includes diagrams and process flowcharts.",
    contentType: "pdf",
    isPremium: false,
    subjectId: "biology",
    tags: ["cell-biology", "genetics", "DNA", "molecular"],
    createdAt: BigInt(Date.now() - 10 * 24 * 3600 * 1000) * BigInt(1_000_000),
    uploader: ANON_PRINCIPAL,
    downloadCount: BigInt(334),
  },
  {
    id: "sample-6",
    title: "World War II: Causes, Course & Consequences",
    description:
      "Detailed study notes covering WWII from its origins in the 1930s through Axis defeat, with analysis of major battles, political decisions, and post-war world order.",
    contentType: "pdf",
    isPremium: false,
    subjectId: "history",
    tags: ["WWII", "modern-history", "essay-notes"],
    createdAt: BigInt(Date.now() - 5 * 24 * 3600 * 1000) * BigInt(1_000_000),
    uploader: ANON_PRINCIPAL,
    downloadCount: BigInt(156),
  },
];
