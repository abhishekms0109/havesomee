"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@/lib/supabase"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  defaultImage?: string
}

export function ImageUpload({ onImageUploaded, defaultImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null)
  const supabase = createClientComponentClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("sweets").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("sweets").getPublicUrl(filePath)

      onImageUploaded(publicUrlData.publicUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("Failed to upload image. Please try again.")
      // Keep the preview if there was one
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded("")
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <div className="relative h-48 w-full">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Product preview"
              fill
              className="object-cover"
              onError={() => {
                // Fallback for preview URLs that might not work with Image component
                setPreviewUrl(null)
                setUploadError("Error displaying preview")
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center text-sm text-orange-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Uploading image...
        </div>
      )}

      {uploadError && (
        <div className="text-sm text-red-500 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {uploadError}
        </div>
      )}

      {previewUrl && !isUploading && !uploadError && (
        <div className="text-sm text-green-500 flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Image uploaded successfully
        </div>
      )}
    </div>
  )
}
