import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const ALLOWED_MIME_TYPES = ["application/pdf"]

/**
 * Accepts a single PDF pattern file from the storefront (guest or
 * authenticated customer) and stores it via the configured File Module
 * provider. The returned file id/url is meant to be attached to a cart
 * line item's metadata (see `addToCart` in the storefront), not linked to
 * any product/variant record.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const file = (req.file ?? null) as Express.Multer.File | null

  if (!file) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No file was uploaded. Send it as a single 'file' field."
    )
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unsupported file type "${file.mimetype}". Only PDF files are accepted.`
    )
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer.toString("base64"),
          access: "public",
        },
      ],
    },
  })

  const uploaded = result[0]

  res.status(200).json({
    file: {
      id: uploaded.id,
      url: uploaded.url,
      filename: file.originalname,
    },
  })
}
