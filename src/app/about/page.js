import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StoryHero from "../../components/StoryHero";
import StatsStrip from "../../components/StatsStrip";
import TeamGrid from "../../components/TeamGrid";
import FeaturesStrip from "../../components/FeaturesStrip";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-20 text-sm">
        <span className="text-black/50">Home</span> /{" "}
        <span className="font-medium text-black">About</span>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-20 px-4 pb-10 sm:px-6 lg:px-20">
        <StoryHero />
        <StatsStrip />
        <TeamGrid />
        <FeaturesStrip />
      </main>

      <Footer />
    </div>
  );
}