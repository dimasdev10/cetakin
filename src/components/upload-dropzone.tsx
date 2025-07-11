"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

import {
  UploadCloud,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImageIcon,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDropzone, type Accept } from "react-dropzone";

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadDropzoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: "image" | "document" | "all";
  maxSize?: number;
  currentFileUrl?: string; // URL file yang sudah ada (dari DB)
  currentPreviewFile?: File | null; // File yang sedang di-preview
  disabled?: boolean;
  className?: string;
  isUploading?: boolean; // Status upload dari parent
  uploadProgress?: number; // Progress upload dari parent
}

export function UploadDropzone({
  onFileSelect,
  accept = "image",
  maxSize = 8 * 1024 * 1024, // Default Size 8MB
  currentFileUrl,
  currentPreviewFile,
  disabled = false,
  className,
  isUploading = false,
  uploadProgress = 0,
}: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [internalPreviewFile, setInternalPreviewFile] =
    useState<FileWithPreview | null>(null);

  // Sinkronisasi currentPreviewFile dari props ke state internal
  useEffect(() => {
    if (currentPreviewFile) {
      const fileWithPreview = Object.assign(currentPreviewFile, {
        preview: currentPreviewFile.type.startsWith("image/")
          ? URL.createObjectURL(currentPreviewFile)
          : undefined,
      });
      setInternalPreviewFile(fileWithPreview);
    } else {
      if (internalPreviewFile?.preview) {
        URL.revokeObjectURL(internalPreviewFile.preview);
      }
      setInternalPreviewFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPreviewFile]);

  // Tipe data untuk file yang diterima
  const getAcceptedFileTypes = (): Accept => {
    switch (accept) {
      case "image":
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        };
      case "document":
        return {
          "image/*": [".png", ".jpg", ".jpeg"],
          "application/pdf": [".pdf"],
        };
      case "all":
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          "application/pdf": [".pdf"],
        };
      default:
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        };
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File terlalu besar. Maksimal ${Math.round(
        maxSize / 1024 / 1024
      )}MB.`;
    }

    const acceptedTypes = getAcceptedFileTypes();
    const isValidType = Object.keys(acceptedTypes).some((type) => {
      if (type === "image/*") {
        return file.type.startsWith("image/");
      }
      return file.type === type;
    });

    if (!isValidType) {
      return "Tipe file tidak didukung.";
    }

    return null;
  };

  const handleFileDropOrSelect = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        toast.error("File tidak valid", {
          description: validationError,
        });
        onFileSelect(null);
        return;
      }

      setError(null);
      onFileSelect(file);
      toast.success("File dipilih");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFileSelect, maxSize, accept]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: handleFileDropOrSelect,
      accept: getAcceptedFileTypes(), // Ini sekarang memiliki tipe yang jelas
      maxFiles: 1,
      disabled: disabled || isUploading,
      maxSize,
    });

  const removeFile = () => {
    if (internalPreviewFile?.preview) {
      URL.revokeObjectURL(internalPreviewFile.preview);
    }
    setInternalPreviewFile(null);
    setError(null);
    onFileSelect(null);
  };

  const getFileIcon = (file: FileWithPreview | string) => {
    if (typeof file === "string") {
      return file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
        <ImageIcon className="h-5 w-5" />
      ) : (
        <File className="h-5 w-5" />
      );
    }
    return file.type.startsWith("image/") ? (
      <ImageIcon className="h-5 w-5" />
    ) : (
      <File className="h-5 w-5" />
    );
  };

  const getFileName = (file: FileWithPreview | string) => {
    if (typeof file === "string") {
      // Extract filename dari URL
      try {
        const url = new URL(file);
        const pathSegments = url.pathname.split("/");
        return pathSegments[pathSegments.length - 1] || "File";
      } catch {
        return file;
      }
    }
    return file.name;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // State 1: File sudah diupload dan tersimpan (dari currentFileUrl)
  if (currentFileUrl && !internalPreviewFile && !isUploading) {
    const isImage = currentFileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-4">
          {isImage ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white">
                <Image
                  src={currentFileUrl || "/placeholder.svg"}
                  alt="Uploaded file"
                  className="w-full h-full object-cover"
                  fill
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=200&width=300";
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    File tersimpan
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <File className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    File tersimpan
                  </p>
                  <p className="text-xs text-green-600">
                    {getFileName(currentFileUrl)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // State 2: Sedang mengupload (isUploading dari parent)
  if (isUploading && internalPreviewFile) {
    const isImage = internalPreviewFile.type.startsWith("image/");
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            {isImage && internalPreviewFile.preview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white">
                <Image
                  src={internalPreviewFile.preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover opacity-75"
                  fill
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getFileIcon(internalPreviewFile)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {internalPreviewFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(internalPreviewFile.size)}
                  </p>
                </div>
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Mengupload...</span>
                <span className="text-blue-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State 3: File dipilih dan di-preview (menampilkan internalPreviewFile, tapi belum diupload)
  if (internalPreviewFile && !isUploading) {
    const isImage = internalPreviewFile.type.startsWith("image/");
    return (
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardContent>
          <div className="space-y-3">
            {isImage && internalPreviewFile.preview ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs border border-amber-800 font-medium flex items-center space-x-1 w-fit">
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={removeFile}
                    disabled={disabled}
                    className="h-7 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus Gambar
                  </Button>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-white">
                  <Image
                    src={internalPreviewFile.preview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    fill
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <div className="p-2 bg-amber-100 rounded-lg">
                  {getFileIcon(internalPreviewFile)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {internalPreviewFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(internalPreviewFile.size)}
                  </p>
                </div>
                <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // State 4: Error saat validasi file (sebelum upload)
  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  File tidak valid
                </p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                onFileSelect(null); // Reset file selection
              }}
            >
              Pilih Ulang
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State 5: Dropzone default
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border border-dashed rounded-lg text-center transition-all cursor-pointer flex flex-col justify-center",
        "hover:border-gray-400 hover:bg-gray-50",
        isDragActive && !isDragReject && "border-blue-400 bg-blue-50",
        isDragReject && "border-red-400 bg-red-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <UploadCloud className="h-6 w-6 text-gray-400" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            {isDragActive
              ? "Lepaskan file di sini"
              : "Klik untuk pilih file atau drag & drop"}
          </p>
          <p className="text-xs text-gray-500">
            {accept === "image" && "PNG, JPG, JPEG, GIF, WEBP"}
            {accept === "document" && "PNG, JPG, JPEG, PDF"}
            {accept === "all" && "PNG, JPG, JPEG, GIF, WEBP, PDF"}
            {" hingga "}
            {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
        {isDragReject && (
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">File tidak didukung</span>
          </div>
        )}
      </div>
    </div>
  );
}
