import { CloudShaderHero } from "@/components/cloud-shader-hero";
import { FeaturesSection } from "@/components/features-section";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CloudShaderHero />
      <FeaturesSection />
    </div>
  );
}
