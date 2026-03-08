"use client";

import Image from "next/image";
import { Card, Button } from "@/shared/ui";
import { useCapturePhoto } from "../hooks";
import { PersonPhotoPlaceholder } from "./PersonPhotoPlaceholder";

export interface CapturePhotoProps {
  label: string;
  description: string;
  value?: string;
  onCapture: (dataUrl: string) => void;
  /** "faciale" => user, "corps" => environment */
  mode?: "faciale" | "corps";
}

export function CapturePhoto({
  label,
  description,
  value,
  onCapture,
  mode = "faciale",
}: CapturePhotoProps) {
  const {
    inputRef,
    videoRef,
    stream,
    previewUrl,
    startCamera,
    stopCamera,
    captureFromVideo,
    handleFileChange,
    clearPhoto,
  } = useCapturePhoto({
    facingMode: mode === "faciale" ? "user" : "environment",
    onCapture,
    initialValue: value,
  });

  return (
    <Card className="p-6">
      <h3 className="font-serif text-lg font-medium text-luxe-or">{label}</h3>
      <p className="mt-1 text-sm text-luxe-blanc-muted">{description}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={mode === "faciale" ? "user" : "environment"}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden
      />

      {previewUrl ? (
        <div className="relative mt-4 aspect-[3/4] max-h-64 w-full overflow-hidden rounded border border-luxe-or-muted/40">
          <Image
            src={previewUrl}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 bg-luxe-noir/80 p-2">
            <Button variant="secondary" fullWidth onClick={clearPhoto}>
              Changer
            </Button>
          </div>
        </div>
      ) : stream ? (
        <div className="relative mt-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded border border-luxe-or-muted/40 aspect-video object-cover"
          />
          <div className="mt-2 flex gap-2">
            <Button variant="primary" fullWidth onClick={captureFromVideo}>
              Prendre la photo
            </Button>
            <Button variant="secondary" fullWidth onClick={stopCamera}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <PersonPhotoPlaceholder className="aspect-[3/4] max-h-64 w-full min-h-[120px]" />
          <div className="flex flex-col gap-2">
            <Button variant="primary" fullWidth onClick={startCamera}>
              Ouvrir la caméra
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => inputRef.current?.click()}
            >
              Choisir un fichier
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
