import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import EventPopup from "@/components/EventPopup";
import FeedbackPopup from "@/components/FeedbackPopup";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Stats from "@/components/Stats";
import Schedule from "@/components/Schedule";
import Organizers from "@/components/Organizers";
import Mentors from "@/components/Mentors";
import BuildFeatures from "@/components/BuildFeatures";
import EventsTable from "@/components/EventsTable";
import Projects from "@/components/Projects";
import Marquee from "@/components/Marquee";
import Gallery from "@/components/Gallery";
import LazyHighlights from "@/components/LazyHighlights";
import FAQ from "@/components/FAQ";
import ExploreCards from "@/components/ExploreCards";
import Footer from "@/components/Footer";
import ScrollNav from "@/components/ScrollNav";

// Event dates decide what the page shows as "next event" and the JSON-LD.
// Rebuild the static page hourly so it never stays stuck on a past event.
export const revalidate = 3600;

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      <EventPopup />
      <FeedbackPopup />
      <ScrollNav />
      <Hero />
      <Countdown />
      <Marquee />
      <Stats />
      <EventsTable />
      <Projects />
      <Schedule />
      <Organizers />
      <Mentors />
      <BuildFeatures />
      <Gallery />
      <LazyHighlights />
      <FAQ />
      <ExploreCards />
      <Footer />
    </main>
  );
}
