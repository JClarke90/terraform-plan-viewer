"use client"

import { useState, useCallback, memo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { ResourceItem } from "./resource-item"
import type { TerraformResource } from "../types/terraform"

interface ResourceListProps {
  resources: TerraformResource[]
}

export const ResourceList = memo(function ResourceList({ resources }: ResourceListProps) {
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({})
  const [expandAll, setExpandAll] = useState(false)

  const toggleResource = useCallback((uniqueId: string) => {
    setExpandedResources((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }))
  }, [])

  const expandAllResources = useCallback(() => {
    const newExpandedState: Record<string, boolean> = {}
    resources.forEach((resource) => {
      newExpandedState[resource.uniqueId] = true
    })
    setExpandedResources(newExpandedState)
    setExpandAll(true)
  }, [resources])

  const collapseAllResources = useCallback(() => {
    setExpandedResources({})
    setExpandAll(false)
  }, [])

  if (!resources.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-gray-500">No resources found in the plan.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Resources ({resources.length})</h2>
          <button
            onClick={expandAll ? collapseAllResources : expandAllResources}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            {expandAll ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {expandAll ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {resources.map((resource) => (
          <ResourceItem
            key={resource.uniqueId}
            resource={resource}
            isExpanded={expandedResources[resource.uniqueId] || false}
            onToggle={() => toggleResource(resource.uniqueId)}
          />
        ))}
      </div>
    </div>
  )
})
