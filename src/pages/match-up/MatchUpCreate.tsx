// src/pages/match-up/MatchUpCreate.tsx

import React, { useState, useRef } from "react"; // Tambahkan useRef
import api from "@/api/axios";
import { toast } from "react-hot-toast";
import { Trash2, Plus, Check, Upload } from "lucide-react";

// --- Imports Komponen UI ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import Navbar from "@/components/ui/layout/Navbar";
import { Switch } from "@/components/ui/switch";
// --- End Imports Komponen UI ---

// Interface untuk Form State di Frontend
interface MatchUpPair {
  id: number; // Dipakai untuk key di React, tidak dikirim ke BE
  term: string;
  definition: string;
}

// Interface untuk Payload yang akan dikirim ke Backend
interface MatchUpPayload {
  title: string;
  description?: string;
  thumbnail: File | null;
  pairs: Omit<MatchUpPair, "id">[]; // Hanya kirim term & definition
  isPublishImmediately: boolean;
}

// Endpoint sudah diperbaiki
const MATCHUP_ENDPOINT = "/api/game/match-up";

export default function MatchUpCreate() {
  const fileInputRef = useRef<HTMLInputElement>(null); // Tambahkan ref untuk input file
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [pairs, setPairs] = useState<MatchUpPair[]>(
    [{ id: Date.now(), term: "", definition: "" }], // Mulai dengan 1 pasangan
  );
  const [isPublishImmediately, setIsPublishImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Fix File Input Handler + Drag & Drop
  const processFile = (file: File) => {
    setThumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      toast.error("Silakan upload file gambar yang valid (PNG, JPG, JPEG, GIF)");
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }
  };
  
  const handleAddPair = () => {
    setPairs([...pairs, { id: Date.now(), term: "", definition: "" }]);
  };

  const handleRemovePair = (id: number) => {
    setPairs(pairs.filter((pair) => pair.id !== id));
  };

  const handlePairChange = (
    id: number,
    field: keyof Omit<MatchUpPair, "id">,
    value: string,
  ) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair,
      ),
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Judul Game harus diisi.");
      return false;
    }
    if (!thumbnail) {
      toast.error("Thumbnail Game harus diisi.");
      return false;
    }
    // MINIMAL PAIRS HARUS 5 SESUAI SKEMA BE
    const validPairs = pairs.filter(
      (p) => p.term.trim() && p.definition.trim(),
    );
    if (validPairs.length < 5) { 
      toast.error("Match Up minimal memiliki 5 pasangan Kata dan Definisi.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: MatchUpPayload = {
      title,
      description: description.trim() || undefined,
      thumbnail: thumbnail,
      pairs: pairs
        .filter((p) => p.term.trim() && p.definition.trim())
        .map((p) => ({
          term: p.term,
          definition: p.definition,
        })),
      isPublishImmediately,
    };

    try {
      const formData = new FormData();

      // 1. FIX NAMA: Gunakan "title" (Sesuai skema dan service BE)
      formData.append("title", payload.title); 
      
      // 2. FILE THUMBNAIL (nama field: thumbnail_image)
      formData.append("thumbnail_image", payload.thumbnail as File);

      // 3. DESKRIPSI (optional)
      if (payload.description)
        formData.append("description", payload.description);

      // 4. FIX NAMA PUBLISH: Gunakan "is_published" (snake_case sesuai skema BE)
      // Skema Zod Anda TIDAK punya isPublishImmediately, jadi kita pakai is_published
      formData.append(
        "is_published",
        String(payload.isPublishImmediately),
      );

      // 5. FIX KRITIS ARRAY: Kirim "pairs" sebagai string JSON (Sesuai skema BE yang sudah diubah ke z.string())
      formData.append("pairs", JSON.stringify(payload.pairs)); 
      
      // 6. Tambahkan field lain yang mungkin diwajibkan skema (misal isTimeBased)
      formData.append("isTimeBased", "false"); // Set default false jika skema BE mewajibkan

      // Kirim data ke backend
      const res = await api.post(MATCHUP_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Game Match Up berhasil dibuat!");
      console.log("Response:", res.data);
      window.location.href = `/my-projects`; 
} catch (err) {
      console.error("Gagal membuat Match Up:", err);
      toast.error("Gagal membuat Match Up. Silakan periksa log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto py-10 px-6">
        <Typography variant="h2" className="mb-6 border-none">
          Create Match Up Game
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* --- INFORMASI DASAR --- */}
          <Card className="p-6 mb-6 shadow-sm">
            <Typography variant="h3" className="mb-4">
              Basic Information
            </Typography>
            <div className="space-y-4">
              <Input
                placeholder="Game Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              
              {/* INPUT FILE QUICK FIX - DENGAN DRAG & DROP DAN PREVIEW */}
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none block">Thumbnail Image *</label>
                
                {!thumbnailPreview ? (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.gif"
                      onChange={handleFileChange}
                      className="hidden"
                      id="thumbnail-input"
                      ref={fileInputRef} // Tambahkan ref
                      required
                    />
                    <label
                      htmlFor="thumbnail-input"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-10 h-10 text-slate-400 mb-2" />
                      <Typography variant="p" className="text-center text-slate-600 font-medium">
                        Drag or click to upload
                      </Typography>
                      <Typography variant="muted" className="text-center text-xs mt-2">
                        Max 2MB — Allowed: png, jpeg
                      </Typography>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative inline-block border rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-40 w-auto object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveThumbnail}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                      <label htmlFor="thumbnail-input-change">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Change
                          </span>
                        </Button>
                      </label>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.gif"
                        onChange={handleFileChange}
                        className="hidden"
                        id="thumbnail-input-change"
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* END INPUT FILE QUICK FIX */}
            </div>
          </Card>
          {/* --- PASANGAN KATA --- */}
          <Card className="p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h3">Word Pairs ({pairs.length})</Typography>
              <Button
                type="button"
                onClick={handleAddPair}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Pair
              </Button>
            </div>

            <div className="space-y-4">
              {pairs.map((pair, index) => (
                <div
                  key={pair.id}
                  className="p-4 border rounded-md bg-white flex flex-col md:flex-row gap-4"
                >
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium mb-1">
                      Term {index + 1} *
                    </Typography>
                    <Input
                      placeholder="e.g., Cat"
                      value={pair.term}
                      onChange={(e) =>
                        handlePairChange(pair.id, "term", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium mb-1">
                      Definition {index + 1} *
                    </Typography>
                    <Input
                      placeholder="e.g., A domestic animal..."
                      value={pair.definition}
                      onChange={(e) =>
                        handlePairChange(pair.id, "definition", e.target.value)
                      }
                    />
                  </div>
                  {pairs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="shrink-0 w-8 h-8 self-center md:self-end"
                      onClick={() => handleRemovePair(pair.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* --- SETTINGS --- */}
          <Card className="p-6 mb-6 shadow-sm">
            <Typography variant="h3" className="mb-4">
              Settings
            </Typography>
            <div className="flex items-center justify-between">
              <label htmlFor="publish-toggle" className="text-base font-medium">
                Publish Immediately
                <Typography variant="muted" className="text-sm block">
                  Game will be visible to others immediately after creation.
                </Typography>
              </label>
              <Switch
                id="publish-toggle"
                checked={isPublishImmediately}
                onCheckedChange={setIsPublishImmediately}
              />
            </div>
          </Card>

          {/* --- SUBMIT --- */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" /> Create Match Up Game
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}