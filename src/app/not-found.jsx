import Link from "next/link";
import TopBar from "../components/TopBar";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
      {/* <Navbar /> */}

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-20 flex items-center gap-3 text-sm">
          <Link href="/" className="text-black/50 transition-opacity hover:opacity-80">
            Home
          </Link>
          <span className="text-black/50">/</span>
          <span className="font-medium text-black">404 Error</span>
        </div>

        {/* Main 404 Content */}
        <div className="flex flex-col items-center justify-center text-center pb-20">
          <h1 className="text-3xl font-medium tracking-wider text-black sm:text-8xl md:text-[110px]">
            404 Not Found
          </h1>

          <p className="mt-8 text-base font-normal text-black">
            Your visited page not found. You may go home page.
          </p>

          <Link href="/" className="mt-10">
            <button
              type="button"
              className="rounded bg-[#DB4444] px-12 py-4 text-base font-medium text-white transition-colors duration-200 hover:bg-[#e03a3a] active:scale-95"
            >
              Back to home page
            </button>
          </Link>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}