"use client";

import { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useFieldArray,
  type Control,
  type FieldErrors,
  useFormContext,
} from "react-hook-form";
import { FieldType } from "@prisma/client";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import type { PackageFormInput } from "@/lib/validations/package";

interface PackageFieldBuilderProps {
  control: Control<PackageFormInput>;
  errors: FieldErrors<PackageFormInput>;
}

const fieldTypeLabels: Record<FieldType, string> = {
  TEXT: "Teks",
  EMAIL: "Email",
  PHONE: "Nomor Telepon",
  FILE: "File Upload",
  SELECT: "Pilihan",
  TEXTAREA: "Teks Panjang",
  DATE: "Tanggal",
};

export function PackageFieldBuilder({
  control,
  errors,
}: PackageFieldBuilderProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "requiredFields",
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = () => {
    append({
      fieldName: "",
      fieldLabel: "",
      fieldType: FieldType.TEXT,
      isRequired: true,
      options: [],
      order: fields.length,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Field yang Diperlukan</Label>
        <Button type="button" onClick={addField} size="sm">
          <Plus className="w-4 h-4" />
          Tambah Field
        </Button>
      </div>

      {fields.length === 0 && (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <p>Belum ada field yang ditambahkan</p>
              <p className="text-sm">
                Klik &quot;Tambah Field&quot; untuk memulai
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <FieldCard
            key={field.id}
            index={index}
            control={control}
            errors={errors.requiredFields?.[index]}
            onRemove={() => remove(index)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            isDragging={draggedIndex === index}
          />
        ))}
      </div>

      {errors.requiredFields?.root && (
        <p className="text-sm text-destructive">
          {errors.requiredFields.root.message}
        </p>
      )}
    </div>
  );
}

interface FieldCardProps {
  index: number;
  control: Control<PackageFormInput>;
  errors: FieldErrors<PackageFormInput["requiredFields"][number]> | undefined;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function FieldCard({
  index,
  errors,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: FieldCardProps) {
  const { register, setValue, watch } = useFormContext<PackageFormInput>();
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  // Watch the current field type to show/hide options
  const currentFieldType = watch(`requiredFields.${index}.fieldType`);
  const currentIsRequired = watch(`requiredFields.${index}.isRequired`);
  const currentOptions = watch(`requiredFields.${index}.options`);

  // Initialize options from form data
  useEffect(() => {
    if (currentOptions && Array.isArray(currentOptions)) {
      setOptions(currentOptions);
    }
  }, [currentOptions]);

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()];
      setOptions(updatedOptions);
      setValue(`requiredFields.${index}.options`, updatedOptions, {
        shouldValidate: true,
      });
      setNewOption("");
    }
  };

  const removeOption = (optionToRemove: string) => {
    const updatedOptions = options.filter(
      (option) => option !== optionToRemove
    );
    setOptions(updatedOptions);
    setValue(`requiredFields.${index}.options`, updatedOptions, {
      shouldValidate: true,
    });
  };

  const handleFieldTypeChange = (value: FieldType) => {
    setValue(`requiredFields.${index}.fieldType`, value, {
      shouldValidate: true,
    });
    if (value !== FieldType.SELECT) {
      setOptions([]);
      setValue(`requiredFields.${index}.options`, [], { shouldValidate: true });
    }
  };

  const handleRequiredChange = (checked: boolean) => {
    setValue(`requiredFields.${index}.isRequired`, checked, {
      shouldValidate: true,
    });
  };

  return (
    <Card
      className={`transition-all shadow-none border-dashed ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <CardTitle className="text-sm">Field {index + 1}</CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`fieldName-${index}`}>Nama Field</Label>
            <Input
              id={`fieldName-${index}`}
              {...register(`requiredFields.${index}.fieldName`)}
              placeholder="contoh: ktp_number"
            />
            {errors?.fieldName && (
              <p className="text-sm text-destructive">
                {errors.fieldName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`fieldLabel-${index}`}>Label Field</Label>
            <Input
              id={`fieldLabel-${index}`}
              {...register(`requiredFields.${index}.fieldLabel`)}
              placeholder="contoh: Nomor KTP"
            />
            {errors?.fieldLabel && (
              <p className="text-sm text-destructive">
                {errors.fieldLabel.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipe Field</Label>
            <Select
              value={currentFieldType}
              onValueChange={handleFieldTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.fieldType && (
              <p className="text-sm text-destructive">
                {errors.fieldType.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Wajib Diisi</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={currentIsRequired}
                onCheckedChange={handleRequiredChange}
              />
              <span className="text-sm text-muted-foreground">
                {currentIsRequired ? "Ya" : "Tidak"}
              </span>
            </div>
          </div>
        </div>

        {currentFieldType === FieldType.SELECT && (
          <div className="space-y-2">
            <Label>Pilihan</Label>
            <div className="flex space-x-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Tambah pilihan..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />
              <Button type="button" onClick={addOption} size="sm">
                Tambah
              </Button>
            </div>
            {options.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {options.map((option, optionIndex) => (
                  <Badge
                    key={optionIndex}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{option}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeOption(option)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hidden input untuk menentukan urutan field */}
        <input
          type="hidden"
          {...register(`requiredFields.${index}.order`)}
          value={index}
        />
      </CardContent>
    </Card>
  );
}
