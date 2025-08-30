"use client"
import { AttributeRenderer } from "./attribute-renderer"
import type { TerraformBlock } from "../types/terraform"
import { Plus, Minus, Repeat } from "lucide-react"
import { TildeIcon } from "./icons/tilde-icon"

interface BlockRendererProps {
  block: TerraformBlock
  resourceAction?: string
}

export function BlockRenderer({ block, resourceAction }: BlockRendererProps) {
  const getBlockActionColor = (action: string) => {
    switch (action) {
      case "-":
        return "border-red-200 border-2"
      case "+":
        return "border-green-200 border-2"
      case "~":
        return "border-blue-200 border-2"
      default:
        return "border-gray-200 border-2"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "-":
        return <Minus className="w-3 h-3" style={{ color: "rgb(230, 10, 10)" }} />
      case "+":
        return <Plus className="w-3 h-3 text-green-500" />
      case "~":
        return <TildeIcon className="w-3 h-3" style={{ color: "rgb(51, 172, 234)" }} />
      case "-/+":
        return <Repeat className="w-3 h-3" style={{ color: "rgb(240, 140, 88)" }} />
      default:
        return null
    }
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-700 mb-1.5 px-1 flex items-center gap-1.5">
        {getActionIcon(block.action)}
        {block.name}
        {block.comment && <span className="text-gray-500 font-normal ml-2">{block.comment}</span>}
      </h4>

      <div
        className={`bg-white border divide-y divide-gray-200 ${getBlockActionColor(block.action)}`}
        style={{
          borderLeft: "none",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
          borderTopRightRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
        }}
      >
        {block.isSensitive ? (
          <div className="px-3 py-2 text-center">
            <span className="text-gray-500 italic text-xs">
              At least one attribute in this block is (or was) sensitive, so its contents will not be displayed.
            </span>
          </div>
        ) : block.attributes && block.attributes.length > 0 ? (
          block.attributes.map((attr, attrIndex) => (
            <AttributeRenderer key={attrIndex} attribute={attr} resourceAction={resourceAction} />
          ))
        ) : (
          <div className="px-3 py-2 text-center">
            <span className="text-gray-500 italic text-xs">No attributes</span>
          </div>
        )}
      </div>
    </div>
  )
}
