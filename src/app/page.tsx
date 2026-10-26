import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ProcessFlow } from "@/components/ProcessFlow";
import { ServiceArea } from "@/components/ServiceArea";
import { Financing } from "@/components/Financing";
import { Reviews } from "@/components/Reviews";
import { Plans } from "@/components/Plans";
import { EstimateForm } from "@/components/EstimateForm";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { PixelConsole } from "@/components/PixelConsole";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <ProcessFlow />
        <ServiceArea />
        <Financing />
        <Reviews />
        <Plans />
        <EstimateForm />
        <Faq />
      </main>
      <Footer />
      <PixelConsole />
    </>
  );
}
