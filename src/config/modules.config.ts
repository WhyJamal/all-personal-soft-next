import {
  BrainCircuit,
  Boxes,
  ChartLine,
  Factory,
  FileBarChart,
  Landmark,
  Layers,
  Plug,
  Puzzle,
  Scale,
  Truck,
  UserCog,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

/** Icon per module/tab id coming from the backend (modules_section.tabs[].id). */
export const moduleIcons: Record<string, LucideIcon> = {
  erp: Boxes,
  core: Layers,
  warehouse: Warehouse,
  reports: FileBarChart,
  reporting: FileBarChart,
  integration: Plug,
  finance: Landmark,
  ifrs: Scale,
  analytics: ChartLine,
  production: Factory,
  logistics: Truck,
  hr: UserCog,
  bi: BrainCircuit,
};

export const fallbackModuleIcon: LucideIcon = Puzzle;
