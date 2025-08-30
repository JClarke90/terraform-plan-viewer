import { Plus, Minus, Repeat } from "lucide-react"
import { TildeIcon } from "../components/icons/tilde-icon"

export function getActionIcon(action: string) {
  switch (action) {
    case "create":
      return <Plus className="w-5 h-5 text-green-600 flex-shrink-0" />
    case "delete":
      return <Minus className="w-5 h-5 flex-shrink-0" style={{ color: "rgb(230, 10, 10)" }} />
    case "update":
      return <TildeIcon className="w-5 h-5 flex-shrink-0" style={{ color: "rgb(51, 172, 234)" }} />
    case "replace":
      return <Repeat className="w-5 h-5 flex-shrink-0" style={{ color: "rgb(240, 140, 88)" }} />
    default:
      return null
  }
}

export function getActionColor(action: string): string {
  switch (action) {
    case "create":
      return "bg-green-50 border border-green-200"
    case "delete":
      return "bg-red-50 border border-red-200"
    case "update":
      return "bg-blue-50 border border-blue-200"
    case "replace":
      return "bg-orange-50 border border-orange-200"
    default:
      return "bg-gray-50 border border-gray-200"
  }
}

export function getActionBorderStyle(action: string) {
  switch (action) {
    case "create":
      return {
        borderLeftWidth: "4px",
        borderLeftColor: "#16a34a", // green-600
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      }
    case "delete":
      return {
        borderLeftWidth: "4px",
        borderLeftColor: "rgb(230, 10, 10)", // custom red
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      }
    case "update":
      return {
        borderLeftWidth: "4px",
        borderLeftColor: "rgb(51, 172, 234)", // custom blue
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      }
    case "replace":
      return {
        borderLeftWidth: "4px",
        borderLeftColor: "rgb(240, 140, 88)", // custom orange
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      }
    default:
      return {
        borderLeftWidth: "4px",
        borderLeftColor: "#9ca3af", // gray-400
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      }
  }
}

export function getActionText(action: string): string {
  switch (action) {
    case "create":
      return "will be created"
    case "delete":
      return "will be destroyed"
    case "update":
      return "will be updated in-place"
    case "replace":
      return "must be replaced"
    default:
      return ""
  }
}
