"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/components/upload-dropzone";

import { FieldType } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import type { PackageWithFields } from "@/types/package";

interface OrderFormProps {
  pkg: PackageWithFields;
  selectedFiles: Record<string, globalThis.File>;
  onFileSelect: (fieldName: string) => (file: globalThis.File | null) => void;
  isSubmitting: boolean;
}

export function OrderFormFields({
  pkg,
  selectedFiles,
  onFileSelect,
  isSubmitting,
}: OrderFormProps) {
  const form = useFormContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderField = (field: any) => {
    switch (field.fieldType) {
      case FieldType.TEXT:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input {...formField} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.EMAIL:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input type="email" {...formField} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.PHONE:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input type="tel" {...formField} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea {...formField} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.SELECT:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Pilih ${field.fieldLabel}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.DATE:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input type="date" {...formField} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldType.FILE:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.fieldName}
            render={() => (
              <FormItem>
                <FormLabel>
                  {field.fieldLabel}
                  {field.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <UploadDropzone
                    onFileSelect={onFileSelect(field.fieldName)}
                    accept="document"
                    maxSize={4 * 1024 * 1024} // 4MB
                    currentPreviewFile={selectedFiles[field.fieldName] || null}
                    disabled={isSubmitting}
                    className="h-[150px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {pkg.requiredFields.sort((a, b) => a.order - b.order).map(renderField)}
    </div>
  );
}
