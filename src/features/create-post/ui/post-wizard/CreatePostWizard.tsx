"use client"

import clsx from "clsx"
import s from "./CreatePostWizard.module.css"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { PublicationStep } from "../steps/publication-step/PublicationStep"
import { SelectStep } from "../steps/select-step/SelectStep"
import { CroppingStep } from "../steps/cropping-step/CroppingStep"
import { Button } from "@/shared/ui"
import { Icon } from "@/shared/ui/Icon"
import { useUploadPostImages, useCreatePost } from "../../api/useCreatePost"

const FiltersStepPlaceholder = () => {
  const setStep = useCreatePostStore((state) => state.setStep)
  return (
    <div className={s.placeholder_container}>
      <p className={s.placeholder_text}>Тут будет шаг Фильтров</p>
      <button type="button" className={s.placeholder_button} onClick={() => setStep("PUBLICATION")}>
        Далее (на Публикацию)
      </button>
    </div>
  )
}

export const CreatePostWizard = () => {
  const { isOpen, step, setStep, reset, data, closeModal } = useCreatePostStore()

  const { mutateAsync: uploadImages, isPending: isUploading } = useUploadPostImages()
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost()

  if (!isOpen) return null

  const isPublication = step === "PUBLICATION"
  const isLoading = isUploading || isCreating

  const getHeaderTitle = () => {
    switch (step) {
      case "SELECT":
        return "Add Photo"
      case "CROP":
        return "Cropping"
      case "FILTERS":
        return "Filters"
      case "PUBLICATION":
        return "Publication"
      default:
        return "Create Post"
    }
  }

  const handleBack = () => {
    switch (step) {
      case "CROP":
        return setStep("SELECT")
      case "FILTERS":
        return setStep("CROP")
      case "PUBLICATION":
        return setStep("FILTERS")
      default:
        return null
    }
  }

  const handlePublish = async () => {
    try {
      const rawFiles = data.images.map((img) => img.file)
      if (rawFiles.length === 0) return

      const fileIds = await uploadImages(rawFiles)

      await createPost({
        description: data.description,
        fileIds: fileIds,
      })

      reset()
    } catch (error) {
      console.error("Ошибка при публикации поста:", error)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (step === "SELECT") {
        reset()
      } else {
        const shouldClose = window.confirm("Are you sure you want to close? Your draft will be saved.")

        if (shouldClose) {
          closeModal()
        }
      }
    }
  }

  return (
    <>
      <div className={s.overlay} onClick={handleOverlayClick} />

      <dialog open className={clsx(s.dialog, isPublication && s.dialog_publication)}>
        <div className={s.header}>
          {step !== "SELECT" ? (
            <Button type="button" className={s.nav_button} onClick={handleBack} disabled={isLoading}>
              <Icon name="arrow-ios-back" />
            </Button>
          ) : (
            <div className={s.header_spacer} />
          )}

          <span className={s.header_title}>{getHeaderTitle()}</span>

          {step === "SELECT" && (
            <Button className={s.nav_button} onClick={reset}>
              ✕
            </Button>
          )}

          {step === "CROP" && (
            <Button className={s.nav_button} onClick={() => setStep("FILTERS")}>
              Next
            </Button>
          )}

          {step === "FILTERS" && (
            <Button className={s.nav_button} onClick={() => setStep("PUBLICATION")}>
              Next
            </Button>
          )}

          {step === "PUBLICATION" && (
            <Button className={s.nav_button} onClick={handlePublish} disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>

        <div className={s.content}>
          {step === "SELECT" && <SelectStep />}
          {step === "CROP" && <CroppingStep />}
          {step === "FILTERS" && <FiltersStepPlaceholder />}
          {step === "PUBLICATION" && <PublicationStep />}
        </div>
      </dialog>
    </>
  )
}
