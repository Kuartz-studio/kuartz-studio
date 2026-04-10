"use client";

import { useState, useRef } from "react";
import { compressImage } from "@/lib/image";
import { ImagePlus, Loader2 } from "lucide-react";

interface ImageUploadProps {
  currentImage: string | null;
  onUpload: (base64: string) => Promise<void>;
  label?: string;
  shape: "circle" | "square";
  /** Compact mode for use inside table cells */
  compact?: boolean;
  /** Fallback text — first letter shown when no image (compact mode) */
  fallbackLabel?: string;
}

export function ImageUpload({ currentImage, onUpload, label, shape, compact, fallbackLabel }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCircle = shape === "circle";
  const sizeClass = compact
    ? (isCircle ? "h-8 w-8" : "h-8 w-8")
    : (isCircle ? "h-20 w-20" : "h-24 w-24");
  const shapeClass = "rounded-full";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-6 w-6";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner un fichier image.");
      return;
    }

    setLoading(true);
    try {
      const base64 = await compressImage(file);
      setPreview(base64);
      await onUpload(base64);
    } catch {
      alert("Erreur lors du traitement de l'image.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const renderFallback = () => {
    if (compact && fallbackLabel) {
      return (
        <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] select-none">
          {fallbackLabel.charAt(0).toUpperCase()}
        </span>
      );
    }
    return <ImagePlus className={`${iconSize} text-[var(--color-muted-foreground)]`} />;
  };

  return (
    <div className={compact ? "inline-flex" : "flex flex-col items-center gap-2"}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`${sizeClass} ${shapeClass} overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-foreground)]/40 transition-colors flex items-center justify-center bg-[var(--color-muted)] cursor-pointer relative group`}
      >
        {loading ? (
          <Loader2 className={`${iconSize} animate-spin text-[var(--color-muted-foreground)]`} />
        ) : preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImagePlus className={`${compact ? "h-3 w-3" : "h-5 w-5"} text-white`} />
            </div>
          </>
        ) : (
          renderFallback()
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}


