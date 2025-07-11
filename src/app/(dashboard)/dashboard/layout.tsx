import DashboardNavbar from "@/components/navbar/dashboard-nav";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-16 w-full">
      <DashboardNavbar />
      <div className="pt-18 pb-10">{children}</div>
    </div>
  );
};

export default DashboardLayout;
