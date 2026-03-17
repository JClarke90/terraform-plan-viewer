"use client"
import { memo, useState, useMemo } from "react"
import type { TerraformAttribute, ParsedRuleObject, SecurityRuleChanges } from "../types/terraform"
import { Plus, Minus, Repeat, Shield, ArrowUp, ArrowDown, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { TildeIcon } from "./icons/tilde-icon"
import { processSecurityRuleChanges } from "../lib/terraform-parser"

// Component to render a security rule card
function SecurityRuleCard({ rule }: { rule: ParsedRuleObject }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getActionStyles = (action: string) => {
    switch (action) {
      case "+":
        return {
          borderColor: "#16a34a",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          label: "Adding",
          icon: <Plus className="w-3.5 h-3.5 text-green-600" />,
        }
      case "-":
        return {
          borderColor: "rgb(230, 10, 10)",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          label: "Removing",
          icon: <Minus className="w-3.5 h-3.5" style={{ color: "rgb(230, 10, 10)" }} />,
        }
      case "~":
        return {
          borderColor: "rgb(51, 172, 234)",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          label: "Updating",
          icon: <TildeIcon className="w-3.5 h-3.5" style={{ color: "rgb(51, 172, 234)" }} />,
        }
      default:
        return {
          borderColor: "#9ca3af",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          label: "Unchanged",
          icon: null,
        }
    }
  }

  const styles = getActionStyles(rule.action)
  const attrs = rule.attributes

  // Get key display values
  const access = attrs.access || "Unknown"
  const protocol = attrs.protocol || "*"
  const sourcePrefix = attrs.source_address_prefix || (attrs.source_address_prefixes?.length ? attrs.source_address_prefixes.join(", ") : "Any")
  const destPrefix = attrs.destination_address_prefix || (attrs.destination_address_prefixes?.length ? attrs.destination_address_prefixes.join(", ") : "Any")
  const destPorts = attrs.destination_port_range || (attrs.destination_port_ranges?.length ? attrs.destination_port_ranges.join(", ") : "Any")

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden ${styles.bgColor}`}
      style={{ borderColor: styles.borderColor }}
    >
      {/* Header - always visible */}
      <div
        className="px-3 py-2 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {styles.icon}
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm text-gray-900">{rule.name || "Unnamed Rule"}</span>
            {rule.priority !== null && (
              <span className="text-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded">
                Priority: {rule.priority}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                access === "Allow" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {access}
            </span>
            {rule.direction && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                {rule.direction === "Inbound" ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUp className="w-3 h-3" />
                )}
                {rule.direction}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Quick summary line */}
        <div className="mt-1.5 text-xs text-gray-600 font-mono">
          <span className="text-gray-500">Source:</span> {truncateValue(sourcePrefix, 30)}
          <span className="mx-2 text-gray-400">{">"}</span>
          <span className="text-gray-500">Dest:</span> {truncateValue(destPrefix, 30)}
          <span className="mx-2 text-gray-400">:</span>
          <span className="text-gray-500">Ports:</span> {truncateValue(destPorts, 20)}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t bg-white px-3 py-2 space-y-1.5" style={{ borderColor: styles.borderColor }}>
          {Object.entries(attrs).map(([key, value]) => {
            // Skip empty arrays and null values for cleaner display
            if (Array.isArray(value) && value.length === 0) return null
            if (value === null || value === "") return null

            return (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="text-gray-500 font-medium min-w-[180px]">{key}:</span>
                <span className="text-gray-800 font-mono">
                  {Array.isArray(value) ? (
                    <span className="flex flex-wrap gap-1">
                      {value.map((v, i) => (
                        <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded">
                          {String(v)}
                        </span>
                      ))}
                    </span>
                  ) : (
                    String(value)
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function truncateValue(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return value.substring(0, maxLength) + "..."
}

// Component to display and compare all security rules
function SecurityRulesDisplay({ rules }: { rules: ParsedRuleObject[] }) {
  const [showAnalysis, setShowAnalysis] = useState(true)

  // Process the rules to identify actual changes
  const ruleChanges = useMemo(() => processSecurityRuleChanges(rules), [rules])

  const hasChanges = ruleChanges.added.length > 0 || ruleChanges.removed.length > 0 || ruleChanges.modified.length > 0

  // If no real changes (just re-ordering), show simplified view
  if (!hasChanges && ruleChanges.unchanged.length > 0) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border">
          No actual rule changes detected - rules may have been reordered or reformatted.
        </div>
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <SecurityRuleCard key={index} rule={rule} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border">
        <div className="flex items-center gap-4 text-xs">
          {ruleChanges.added.length > 0 && (
            <span className="flex items-center gap-1 text-green-700">
              <Plus className="w-3 h-3" /> {ruleChanges.added.length} new
            </span>
          )}
          {ruleChanges.removed.length > 0 && (
            <span className="flex items-center gap-1" style={{ color: "rgb(230, 10, 10)" }}>
              <Minus className="w-3 h-3" /> {ruleChanges.removed.length} removed
            </span>
          )}
          {ruleChanges.modified.length > 0 && (
            <span className="flex items-center gap-1" style={{ color: "rgb(51, 172, 234)" }}>
              <TildeIcon className="w-3 h-3" /> {ruleChanges.modified.length} modified
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showAnalysis ? "Show raw" : "Show analysis"}
        </button>
      </div>

      {showAnalysis ? (
        <div className="space-y-4">
          {/* Modified Rules - Show before/after comparison */}
          {ruleChanges.modified.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <TildeIcon className="w-3 h-3" style={{ color: "rgb(51, 172, 234)" }} />
                Modified Rules
              </h5>
              {ruleChanges.modified.map((mod, index) => (
                <ModifiedRuleCard key={index} oldRule={mod.old} newRule={mod.new} changes={mod.changes} />
              ))}
            </div>
          )}

          {/* Added Rules */}
          {ruleChanges.added.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Plus className="w-3 h-3 text-green-600" />
                New Rules
              </h5>
              {ruleChanges.added.map((rule, index) => (
                <SecurityRuleCard key={index} rule={rule} />
              ))}
            </div>
          )}

          {/* Removed Rules */}
          {ruleChanges.removed.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Minus className="w-3 h-3" style={{ color: "rgb(230, 10, 10)" }} />
                Removed Rules
              </h5>
              {ruleChanges.removed.map((rule, index) => (
                <SecurityRuleCard key={index} rule={rule} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Raw view - just show all rules as cards
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <SecurityRuleCard key={index} rule={rule} />
          ))}
        </div>
      )}
    </div>
  )
}

// Component to show a modified rule with before/after comparison
function ModifiedRuleCard({
  oldRule,
  newRule,
  changes,
}: {
  oldRule: ParsedRuleObject
  newRule: ParsedRuleObject
  changes: string[]
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  const attrs = newRule.attributes
  const access = attrs.access || "Unknown"

  return (
    <div
      className="rounded-lg border-2 overflow-hidden bg-blue-50"
      style={{ borderColor: "rgb(51, 172, 234)" }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TildeIcon className="w-3.5 h-3.5" style={{ color: "rgb(51, 172, 234)" }} />
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm text-gray-900">{newRule.name || "Unnamed Rule"}</span>
            {newRule.priority !== null && (
              <span className="text-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded">
                Priority: {newRule.priority}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
              {changes.length} change{changes.length !== 1 ? "s" : ""}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                access === "Allow" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {access}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Changed attributes summary */}
        <div className="mt-1.5 text-xs text-gray-600">
          <span className="text-gray-500">Changed:</span>{" "}
          <span className="font-mono">{changes.join(", ")}</span>
        </div>
      </div>

      {/* Expanded comparison */}
      {isExpanded && (
        <div className="border-t bg-white px-3 py-2" style={{ borderColor: "rgb(51, 172, 234)" }}>
          {changes.map((key) => {
            const oldVal = oldRule.attributes[key]
            const newVal = newRule.attributes[key]

            return (
              <div key={key} className="py-1.5 border-b last:border-b-0 border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-1">{key}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Before:</div>
                    <div className="text-xs font-mono" style={{ color: "rgb(230, 10, 10)" }}>
                      {formatValue(oldVal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">After:</div>
                    <div className="text-xs font-mono text-green-600">{formatValue(newVal)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Helper to format values for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return "null"
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    return value.join(", ")
  }
  return String(value)
}

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
      // Check if this is an array of parsed NSG/route rule objects
      const isSecurityRuleArray = value.length > 0 && typeof value[0] === "object" && value[0] !== null && "attributes" in value[0] && "action" in value[0]

      if (isSecurityRuleArray) {
        return <SecurityRulesDisplay rules={value as ParsedRuleObject[]} />
      }

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
