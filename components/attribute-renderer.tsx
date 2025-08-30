"use client"
import { memo } from "react"
import type { TerraformAttribute } from "../types/terraform"
import { Plus, Minus, Repeat } from "lucide-react"
import { TildeIcon } from "./icons/tilde-icon"

interface AttributeRendererProps {
  attribute: TerraformAttribute
  resourceAction?: string
}

export const AttributeRenderer = memo(function AttributeRenderer({
  attribute,
  resourceAction,
}: AttributeRendererProps) {
  const renderValue = (value: any, action?: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic text-xs">null</span>
    }

    if (value === "(known after apply)") {
      return <span className="text-gray-400 italic text-xs">Known after apply</span>
    }

    if (typeof value === "boolean") {
      return <span className="text-gray-900 text-xs">{value.toString()}</span>
    }

    if (typeof value === "number") {
      return <span className="text-gray-900 text-xs">{value}</span>
    }

    // Handle arrow syntax (value1 -> value2) and convert to before/after display
    if (typeof value === "string" && value.includes(" -> ")) {
      const parts = value.split(" -> ")
      if (parts.length === 2) {
        const beforeValue = parts[0].trim().replace(/"/g, "")
        const afterValue = parts[1].trim().replace(/"/g, "")

        return (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 mb-1">Before:</div>
            <div className="text-red-600 text-xs mb-2">{beforeValue}</div>
            <div className="text-xs font-medium text-gray-500 mb-1">After:</div>
            <div className="text-green-600 text-xs">{afterValue}</div>
          </div>
        )
      }
    }

    // Handle change objects (from/to or before/after)
    if (typeof value === "object" && (value.from !== undefined || value.before !== undefined)) {
      const beforeValue = value.before || value.from
      const afterValue = value.after || value.to

      return (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 mb-1">Before:</div>
          <div className="mb-2">
            {Array.isArray(beforeValue) ? (
              <div className="space-y-1">
                {beforeValue.map((item, index) => {
                  const itemStr = String(item).replace(/^[+-~]\s*/, "")
                  const isResourceId =
                    itemStr.includes("/subscriptions/") ||
                    itemStr.includes("/resourceGroups/") ||
                    itemStr.includes("/providers/") ||
                    itemStr.startsWith("/subscriptions/") ||
                    itemStr.length > 40

                  if (isResourceId) {
                    return (
                      <div
                        key={index}
                        className="font-mono text-xs text-red-600 bg-gray-50 border px-2 py-1 rounded break-all"
                      >
                        {item}
                      </div>
                    )
                  }
                  return (
                    <div
                      key={index}
                      className="font-mono text-xs text-red-600 bg-gray-100 px-1 py-0.5 rounded inline-block mr-1"
                    >
                      {item}
                    </div>
                  )
                })}
              </div>
            ) : (
              (() => {
                const beforeStr = String(beforeValue)
                const isBeforeResourceId =
                  beforeStr.includes("/subscriptions/") ||
                  beforeStr.includes("/resourceGroups/") ||
                  beforeStr.includes("/providers/") ||
                  beforeStr.startsWith("/subscriptions/") ||
                  beforeStr.length > 40

                if (isBeforeResourceId) {
                  return (
                    <div className="font-mono text-xs text-red-600 bg-gray-50 border px-2 py-1 rounded break-all">
                      {beforeStr}
                    </div>
                  )
                } else {
                  return <span className="text-red-600 text-xs">{beforeStr}</span>
                }
              })()
            )}
          </div>
          <div className="text-xs font-medium text-gray-500 mb-1">After:</div>
          <div>
            {(() => {
              const afterStr = String(afterValue)
              const isAfterResourceId =
                afterStr.includes("/subscriptions/") ||
                afterStr.includes("/resourceGroups/") ||
                afterStr.includes("/providers/") ||
                afterStr.startsWith("/subscriptions/") ||
                afterStr.length > 40

              if (isAfterResourceId) {
                return (
                  <div className="font-mono text-xs text-green-600 bg-gray-50 border px-2 py-1 rounded break-all">
                    {afterStr}
                  </div>
                )
              } else {
                return <span className="text-green-600 text-xs">{afterStr}</span>
              }
            })()}
          </div>
        </div>
      )
    }

    // Handle arrays properly - render each item separately
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => {
            // Check if this is a formatted object string
            if (typeof item === "string" && item.includes("{\n")) {
              return (
                <div key={index} className="bg-gray-50 border rounded p-3 font-mono text-xs">
                  {item.split("\n").map((line, lineIndex) => {
                    const trimmedLine = line.trim()
                    if (!trimmedLine) return <div key={lineIndex} className="h-2"></div>

                    // Handle opening/closing braces
                    if (trimmedLine === "{" || trimmedLine === "}") {
                      return (
                        <div key={lineIndex} className="text-gray-600 font-bold">
                          {trimmedLine}
                        </div>
                      )
                    }

                    // Handle property lines
                    if (trimmedLine.includes(" = ")) {
                      const changeSymbol = trimmedLine.match(/^([+~-])\s/)?.[1] || ""
                      const cleanLine = trimmedLine.replace(/^[+~-]\s/, "")
                      const [key, ...valueParts] = cleanLine.split(" = ")
                      const value = valueParts.join(" = ")

                      let textColor = "text-gray-900"
                      let customStyle = {}
                      if (changeSymbol === "+") {
                        textColor = "text-green-600"
                      } else if (changeSymbol === "-") {
                        customStyle = { color: "rgb(230, 10, 10)" }
                      } else if (changeSymbol === "~") {
                        customStyle = { color: "rgb(51, 172, 234)" }
                      }

                      return (
                        <div key={lineIndex} className={`pl-4 ${textColor}`} style={customStyle}>
                          <span className="font-semibold">{key}</span>
                          <span className="text-gray-500"> = </span>
                          <span>{value}</span>
                        </div>
                      )
                    }

                    // Handle array items within objects
                    if (trimmedLine.match(/^\s*[+~-]?\s*"/) || trimmedLine.match(/^\s*[+~-]?\s*\w/)) {
                      const changeSymbol = trimmedLine.match(/^([+~-])\s/)?.[1] || ""
                      const cleanLine = trimmedLine.replace(/^[+~-]\s/, "").replace(/^\s+/, "")

                      let textColor = "text-gray-700"
                      let customStyle = {}
                      if (changeSymbol === "+") {
                        textColor = "text-green-600"
                      } else if (changeSymbol === "-") {
                        customStyle = { color: "rgb(230, 10, 10)" }
                      } else if (changeSymbol === "~") {
                        customStyle = { color: "rgb(51, 172, 234)" }
                      }

                      return (
                        <div key={lineIndex} className={`pl-8 ${textColor}`} style={customStyle}>
                          {cleanLine}
                        </div>
                      )
                    }

                    return (
                      <div key={lineIndex} className="text-gray-600">
                        {trimmedLine}
                      </div>
                    )
                  })}
                </div>
              )
            }

            // Handle simple array items
            const itemStr = String(item).replace(/^[+-~]\s*/, "")
            const isResourceId =
              itemStr.includes("/subscriptions/") ||
              itemStr.includes("/resourceGroups/") ||
              itemStr.includes("/providers/") ||
              itemStr.startsWith("/subscriptions/") ||
              itemStr.length > 40

            if (isResourceId) {
              let textColor = "text-gray-900"
              let customStyle = {}
              if (String(item).startsWith("+ ")) {
                textColor = "text-green-600"
              } else if (String(item).startsWith("- ")) {
                customStyle = { color: "rgb(230, 10, 10)" }
              } else if (String(item).startsWith("~ ")) {
                customStyle = { color: "rgb(51, 172, 234)" }
              }

              return (
                <div
                  key={index}
                  className={`font-mono text-xs bg-gray-50 border px-2 py-1 rounded break-all ${textColor}`}
                  style={customStyle}
                >
                  {item}
                </div>
              )
            }
            return (
              <div
                key={index}
                className="text-gray-900 font-mono text-xs bg-gray-100 px-1 py-0.5 rounded inline-block mr-1"
              >
                {item}
              </div>
            )
          })}
        </div>
      )
    }

    // Handle strings
    if (typeof value === "string") {
      const isResourceId =
        value.includes("/subscriptions/") ||
        value.includes("/resourceGroups/") ||
        value.includes("/providers/") ||
        value.startsWith("/subscriptions/")

      const isMultiLine = value.includes("\n")

      if (isResourceId || value.length > 40 || isMultiLine) {
        let textColor = "text-gray-900"
        let customStyle = {}
        if (action === "+") {
          textColor = "text-green-600"
        } else if (action === "-") {
          customStyle = { color: "rgb(230, 10, 10)" }
        } else if (action === "~") {
          customStyle = { color: "rgb(51, 172, 234)" }
        }

        return (
          <div
            className={`font-mono text-xs ${textColor} bg-gray-50 border px-2 py-1 rounded ${
              isMultiLine ? "whitespace-pre-wrap" : "break-all"
            }`}
            style={customStyle}
          >
            {isMultiLine ? value : `"${value}"`}
          </div>
        )
      }

      return <span className="text-gray-900 text-xs">"{value}"</span>
    }

    return <span className="text-gray-900 text-xs">{String(value)}</span>
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "+":
        return <Plus className="w-4 h-4 text-green-600 flex-shrink-0" />
      case "-":
        return <Minus className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(230, 10, 10)" }} />
      case "~":
        return <TildeIcon className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(51, 172, 234)" }} />
      case "-/+":
        return <Repeat className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(240, 140, 88)" }} />
      default:
        // Handle resource-level actions when no attribute-level action exists
        if (resourceAction === "replace")
          return <Repeat className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(240, 140, 88)" }} />
        if (resourceAction === "update")
          return <TildeIcon className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(51, 172, 234)" }} />
        if (resourceAction === "create") return <Plus className="w-4 h-4 text-green-600 flex-shrink-0" />
        if (resourceAction === "delete")
          return <Minus className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(230, 10, 10)" }} />
        return null
    }
  }

  const getLeftBorderStyle = (action: string, resourceAction?: string) => {
    const effectiveAction = action || resourceAction || ""

    switch (effectiveAction) {
      case "+":
      case "create":
        return {
          borderLeftWidth: "2px",
          borderLeftColor: "#16a34a",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        } // green-600
      case "-":
      case "delete":
        return {
          borderLeftWidth: "2px",
          borderLeftColor: "rgb(230, 10, 10)",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        } // custom red
      case "~":
      case "update":
        return {
          borderLeftWidth: "2px",
          borderLeftColor: "rgb(51, 172, 234)",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        } // custom blue
      case "-/+":
      case "replace":
        return {
          borderLeftWidth: "2px",
          borderLeftColor: "rgb(240, 140, 88)",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        } // custom orange
      default:
        return {
          borderLeftWidth: "2px",
          borderLeftColor: "#9ca3af",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        } // gray-400
    }
  }

  return (
    <div
      className="grid grid-cols-[200px_1fr] gap-3 py-1.5 px-3 hover:bg-gray-50/50"
      style={getLeftBorderStyle(attribute.action, resourceAction)}
    >
      <div className="flex items-center gap-1.5">
        {getActionIcon(attribute.action || resourceAction || "")}
        <span className="text-xs font-medium text-gray-700 truncate">{attribute.key}:</span>
      </div>
      <div className="text-xs min-w-0">{renderValue(attribute.value, attribute.action || resourceAction)}</div>
    </div>
  )
})
