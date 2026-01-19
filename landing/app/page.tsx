import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntroVideo from "@/components/IntroVideo";
import Hero from "@/sections/Hero";
import Features from "@/sections/Features";
import AiAssistant from "@/sections/AiAssistant";
import RBAC from "@/sections/RBAC";
import Auth from "@/sections/Auth";

export default function Home() {
  return (
    <main className="relative">
      <IntroVideo />
      <Navbar />
      <Hero />
      <Features />
      <AiAssistant />
      <RBAC />
      <Auth />
      <Footer />
    </main>
  );
}
