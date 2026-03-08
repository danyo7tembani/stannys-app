"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface UseCapturePhotoOptions {
  /** "user" pour faciale, "environment" pour corps */
  facingMode?: "user" | "environment";
  onCapture: (dataUrl: string) => void;
  initialValue?: string | null;
}

export function useCapturePhoto({
  facingMode = "user",
  onCapture,
  initialValue,
}: UseCapturePhotoOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValue ?? null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 1280, height: 720 },
      });
      setStream(mediaStream);
    } catch {
      inputRef.current?.click();
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const captureFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreviewUrl(dataUrl);
    onCapture(dataUrl);
    stopCamera();
  }, [onCapture, stopCamera]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        onCapture(dataUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [onCapture]
  );

  const clearPhoto = useCallback(() => {
    setPreviewUrl(null);
    onCapture("");
  }, [onCapture]);

  return {
    inputRef,
    videoRef,
    stream,
    previewUrl,
    startCamera,
    stopCamera,
    captureFromVideo,
    handleFileChange,
    clearPhoto,
  };
}
