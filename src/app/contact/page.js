import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import ContactSection from "../../components/ContactSection";

export default function ContactPage() {
  return (
    <>
      <TopBar />
      <Navbar />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <main className="page-shell pb-16">
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
