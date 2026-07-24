import TrendingDiscussion from "@/components/TrendingDiscussion";
import BorderGlow from "@/components/BorderGlow";
import Reveal from "@/components/Reveal";

export default function Trending() {
  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-6 2xl:max-w-[1400px]">
        <Reveal>
          <BorderGlow
            backgroundColor="#191919"
            glowColor="0 100% 71%"
            colors={["#FF6B6B", "#FF8E72", "#FFFFFF"]}
            borderRadius={20}
            glowRadius={32}
            glowIntensity={0.5}
            coneSpread={30}
            edgeSensitivity={35}
          >
            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">What people are curating</p>
            </div>
          </BorderGlow>
        </Reveal>
      </div>
      <TrendingDiscussion />
    </div>
  );
}
