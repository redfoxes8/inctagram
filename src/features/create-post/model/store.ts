"use client"

import { create } from "zustand"
import { CreatePostStep, CreatePostData, ImageItem } from "./types"

interface CreatePostState {
  isOpen: boolean
  step: CreatePostStep
  data: CreatePostData
  openModal: () => void
  closeModal: () => void
  setStep: (step: CreatePostStep) => void

  setFiles: (files: File[]) => void
  setCurrentImageIndex: (index: number) => void
  updateImageItem: (index: number, updatedFields: Partial<Omit<ImageItem, "id">>) => void

  setDescription: (text: string) => void
  setLocation: (location: string) => void
  reset: () => void
}

const initialData: CreatePostData = {
  images: [],
  currentImageIndex: 0,
  description: "",
  location: "",
}

export const useCreatePostStore = create<CreatePostState>((set) => ({
  isOpen: false,
  step: "SELECT",
  data: initialData,

  openModal: () => set({ isOpen: true, step: "SELECT" }),

  closeModal: () => set({ isOpen: false }),

  setStep: (step) => set({ step }),

  setFiles: (files) => {
    const promises = files.map((file, index) => {
      return new Promise<ImageItem>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          resolve({
            id: `${file.name}-${index}-${Date.now()}`,
            file,
            originalImage: base64,
            croppedImage: base64,
            cropArea: null,
            filter: null,
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then((newImages) => {
      useCreatePostStore.setState((state) => ({
        data: {
          ...state.data,
          images: newImages,
          currentImageIndex: 0,
        },
        step: "CROP",
      }))
    })
  },

  setCurrentImageIndex: (index) =>
    set((state) => ({
      data: { ...state.data, currentImageIndex: index },
    })),

  updateImageItem: (index, updatedFields: Partial<Omit<ImageItem, "id">>) =>
    set((state) => {
      const updatedImages = [...state.data.images]
      if (updatedImages[index]) {
        updatedImages[index] = { ...updatedImages[index], ...updatedFields }
      }
      return {
        data: { ...state.data, images: updatedImages },
      }
    }),

  setDescription: (description) =>
    set((state) => ({
      data: { ...state.data, description },
    })),

  setLocation: (location) =>
    set((state) => ({
      data: { ...state.data, location },
    })),

  reset: () =>
    set({
      isOpen: false,
      step: "SELECT",
      data: {
        images: [],
        currentImageIndex: 0,
        description: "",
        location: "",
      },
    }),
}))
