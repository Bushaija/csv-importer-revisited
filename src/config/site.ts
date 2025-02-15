import { env } from "@/env"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "CSV Importer",
  description:
    "CSV importer built with shadcn-ui, react-dropzone, and papaparse.",
  url:
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://importer.sadmn.com",
  links: { github: "https://github.com/sadmann7/csv-importer" },
}