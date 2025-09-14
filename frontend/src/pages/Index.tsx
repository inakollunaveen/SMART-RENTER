import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        {/* ✅ Featured Properties section removed */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
