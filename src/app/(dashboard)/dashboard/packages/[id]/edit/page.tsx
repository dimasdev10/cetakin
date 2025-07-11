import { notFound } from "next/navigation";

import { PackageForm } from "@/components/form/package-form";

import { getPackage } from "@/actions/package";

interface EditPackagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPackagePage({
  params,
}: EditPackagePageProps) {
  const { id } = await params;

  const packageData = await getPackage(id);

  console.log("Package Data:", packageData);

  if (!packageData) {
    notFound();
  }

  return <PackageForm mode="edit" initialData={packageData} />;
}
