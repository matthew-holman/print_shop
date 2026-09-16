"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ProductPrice from "../product-price"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

type UploadedFile = {
  id: string
  url: string
  filename: string
}

const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50MB, matches the backend limit

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const countryCode = useParams().countryCode as string

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [quantity, setQuantity] = useState(1)
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // If there is only 1 variant, preselect the options - this store's
  // print product usually only has one (e.g. "Standard A0 print").
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const handleFileSelect = async (fileList: FileList | null) => {
    const selected = fileList?.[0]
    if (!selected) return

    setUploadError(null)

    if (selected.type !== "application/pdf") {
      setUploadError("Please upload a PDF file.")
      return
    }

    if (selected.size > MAX_FILE_BYTES) {
      setUploadError("That file is larger than 50MB — try a smaller export.")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selected)

      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/pattern-uploads`, {
        method: "POST",
        headers: MEDUSA_PUBLISHABLE_KEY
          ? { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY }
          : undefined,
        body: formData,
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()
      setFile(data.file as UploadedFile)
    } catch {
      setUploadError("Something went wrong uploading that file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || !file) return

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
      metadata: {
        pattern_file_id: file.id,
        pattern_file_url: file.url,
        pattern_file_name: file.filename,
      },
    })

    setIsAdding(false)
    setJustAdded(true)
    setFile(null)
    setQuantity(1)
  }

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1

  return (
    <div className="flex flex-col gap-6">
      {hasMultipleVariants && (
        <div className="flex flex-col gap-y-4">
          {(product.options || []).map((option) => (
            <div key={option.id}>
              <OptionSelect
                option={option}
                current={options[option.id]}
                updateOption={setOptionValue}
                title={option.title ?? ""}
                data-testid="product-options"
                disabled={!!disabled || isAdding}
              />
            </div>
          ))}
          <Divider />
        </div>
      )}

      {justAdded ? (
        <div className="flex flex-col gap-4 bg-terracotta-tint rounded-lg p-6">
          <p className="text-sm text-ink">
            Added to your cart. Upload another pattern, or check out when
            you&apos;re ready.
          </p>
          <div className="flex flex-col items-stretch gap-3">
            <Button
              variant="secondary"
              className="whitespace-nowrap"
              onClick={() => setJustAdded(false)}
            >
              Upload another pattern
            </Button>
            <a href={`/${countryCode}/checkout?step=address`}>
              <Button variant="primary" className="w-full whitespace-nowrap">
                Go to checkout
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <>
          {!file ? (
            <label
              className="border-[1.5px] border-dashed border-line rounded-lg bg-white px-6 py-10 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-terracotta transition-colors"
              data-testid="pattern-dropzone"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B85C38"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4M12 4 7 9M12 4l5 5" />
                <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
              <span className="text-sm font-semibold text-ink">
                {isUploading ? "Uploading…" : "Drag your PDF here, or browse"}
              </span>
              <span className="text-xs text-ink-muted">
                PDF only &middot; up to 50MB
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={isUploading || !!disabled}
                onChange={(e) => handleFileSelect(e.target.files)}
                data-testid="pattern-file-input"
              />
            </label>
          ) : (
            <div className="border border-line rounded-lg bg-white p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded bg-terracotta-tint flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B85C38" strokeWidth="1.6" aria-hidden="true">
                  <path d="M6 2h9l5 5v15H6z" />
                  <path d="M15 2v5h5" />
                </svg>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-ink truncate">
                  {file.filename}
                </span>
                <span className="text-xs text-ink-muted">Ready to print</span>
              </div>
              <button
                type="button"
                className="text-xs text-ink-muted hover:text-terracotta shrink-0"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-terracotta-dark">{uploadError}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Copies</span>
            <div className="flex items-center border border-line rounded">
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center text-ink disabled:opacity-40"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease copies"
              >
                &minus;
              </button>
              <span className="w-9 text-center text-sm font-semibold text-ink">
                {quantity}
              </span>
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center text-ink"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase copies"
              >
                +
              </button>
            </div>
          </div>

          <ProductPrice product={product} variant={selectedVariant} />

          <Button
            onClick={handleAddToCart}
            disabled={
              !file ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              isUploading ||
              !isValidVariant
            }
            variant="primary"
            className="w-full h-11"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select an option"
              : !file
              ? "Upload a pattern to continue"
              : "Add to cart"}
          </Button>
        </>
      )}
    </div>
  )
}
