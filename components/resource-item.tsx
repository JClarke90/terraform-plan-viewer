"use client"

import { memo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { AttributeRenderer } from "./attribute-renderer"
import { BlockRenderer } from "./block-renderer"
import { getActionIcon, getActionColor, getActionBorderStyle, getActionText } from "../lib/terraform-utils"
import type { TerraformResource } from "../types/terraform"

interface ResourceItemProps {
  resource: TerraformResource
  isExpanded: boolean
  onToggle: () => void
}

export const ResourceItem = memo(function ResourceItem({ resource, isExpanded, onToggle }: ResourceItemProps) {
  // Get the color classes and inline styles for this resource action
  const colorClasses = getActionColor(resource.action)
  const borderStyle = getActionBorderStyle(resource.action)

  return (
    <div className={colorClasses} style={borderStyle}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-white/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        {getActionIcon(resource.action)}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm text-gray-900 truncate">{resource.displayName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{getActionText(resource.action)}</div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="space-y-3 p-3">
            {/* Resource-level attributes */}
            {Object.entries(resource.attributes).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1.5 px-1">Attributes</h4>
                <div
                  className="bg-white border divide-y divide-gray-200"
                  style={{
                    borderLeft: "none",
                    borderTopLeftRadius: "0",
                    borderBottomLeftRadius: "0",
                    borderTopRightRadius: "0.5rem",
                    borderBottomRightRadius: "0.5rem",
                  }}
                >
                  {Object.entries(resource.attributes).map(([key, attr]) => (
                    <AttributeRenderer key={key} attribute={attr} resourceAction={resource.action} />
                  ))}
                </div>
              </div>
            )}

            {/* Blocks */}
            {resource.blocks?.map((block, blockIndex) => (
              <BlockRenderer key={blockIndex} block={block} resourceAction={resource.action} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})
