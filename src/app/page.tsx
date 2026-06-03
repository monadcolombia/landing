import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import EventPopup from "@/components/EventPopup";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Stats from "@/components/Stats";
import Schedule from "@/components/Schedule";
import Organizers from "@/components/Organizers";
import Mentors from "@/components/Mentors";
import BuildFeatures from "@/components/BuildFeatures";
import EventsTable from "@/components/EventsTable";
import Marquee from "@/components/Marquee";
import Gallery from "@/components/Gallery";
import Highlights from "@/components/Highlights";
import FAQ from "@/components/FAQ";
import ExploreCards from "@/components/ExploreCards";
import Footer from "@/components/Footer";
import ScrollNav from "@/components/ScrollNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      <EventPopup />
      <ScrollNav />
      <Hero />
      <Countdown />
      <Marquee />
      <Stats />
      <EventsTable />
      <Schedule />
      <Organizers />
      <Mentors />
      <BuildFeatures />
      <Gallery />
      <Highlights />
      <FAQ />
      <ExploreCards />
      <Footer />
    </main>
  );
}
