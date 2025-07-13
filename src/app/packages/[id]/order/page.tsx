import { LandingNavbar } from "@/components/navbar/landing-nav";
import { OrderPageClient } from "@/app/packages/[id]/order/client";

import { getPackage } from "@/actions/package";
import { createOrderAndInitiatePayment } from "@/actions/order";

interface PackageDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({ params }: PackageDetailPageProps) {
  const { id } = await params;

  const packageDetails = await getPackage(id);

  const handleOrderSubmitAction = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: Record<string, any>,
    uploadedFileDetails: {
      fieldName: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }[]
  ) => {
    "use server";
    const result = await createOrderAndInitiatePayment(
      packageDetails?.id as string,
      formData,
      uploadedFileDetails
    );

    if (result.error) {
      console.error("Error creating order:", result.error);
      return { success: false, message: result.error };
    }

    return {
      success: true,
      snapToken: result.snapToken,
      orderId: result.orderId,
    };
  };

  return (
    <>
      <LandingNavbar />
      <main className="px-4 md:px-14">
        <div className="border-r border-l border-dashed px-4 pt-24 min-h-screen">
          <OrderPageClient
            pkg={packageDetails!}
            onSubmitAction={handleOrderSubmitAction}
          />
        </div>
      </main>
    </>
  );
}
