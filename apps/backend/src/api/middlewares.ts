import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

// Pattern PDFs are kept in memory only long enough to hand them to the File
// Module provider (see uploadFilesWorkflow in the route handler) - nothing
// is written to local disk by multer itself.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
})

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/pattern-uploads",
      middlewares: [upload.single("file")],
    },
  ],
})
