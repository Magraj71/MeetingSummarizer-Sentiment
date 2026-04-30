import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col w-full bg-[#f7f3ef] dark:bg-neutral-950 transition-colors">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
