import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/actions/current-user";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await getCurrentUser();
  if (!user) throw new UploadThingError("Unauthorized");

  return { userId: user.id };
};

export const ourFileRouter = {
  // Package images - untuk admin
  packageImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "Package image upload completed for userId:",
        metadata.userId
      );
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // Document files - untuk user upload dokumen
  documentFile: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload completed for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
