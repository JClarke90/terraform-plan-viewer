"use client"

import { useState, useCallback, useMemo, useTransition } from "react"
import { AlertCircle } from "lucide-react"
import { PlanInput } from "./plan-input"
import { PlanSummary } from "./plan-summary"
import { ResourceList } from "./resource-list"
import { parseTerraformPlan } from "../lib/terraform-parser"
import { SAMPLE_PLAN } from "../lib/sample-data"
import type { TerraformPlan, ParseError } from "../types/terraform"

export default function TerraformPlanViewer() {
  const [planData, setPlanData] = useState<TerraformPlan | null>(null)
  const [planInput, setPlanInput] = useState("")
  const [showInput, setShowInput] = useState(true)
  const [parseError, setParseError] = useState<ParseError | null>(null)
  const [isPending, startTransition] = useTransition()

  const handlePlanSubmit = useCallback(async () => {
    if (!planInput.trim()) return

    setParseError(null)

    startTransition(() => {
      try {
        const result = parseTerraformPlan(planInput)

        if (result.resource_changes.length === 0) {
          setParseError({
            message: "No resources found in the plan output",
            details:
              "Make sure you're pasting the complete terraform plan output. The parser looks for lines like '+ resource \"type\" \"name\" {' or '# resource.name will be created'",
          })
        } else {
          setPlanData(result)
          setShowInput(false)
        }
      } catch (error) {
        setParseError({
          message: "Failed to parse Terraform plan output",
          details: error instanceof Error ? error.message : "Unknown error occurred",
        })
      }
    })
  }, [planInput])

  const loadSampleData = useCallback(() => {
    setPlanInput(SAMPLE_PLAN)
    startTransition(() => {
      try {
        const result = parseTerraformPlan(SAMPLE_PLAN)
        setPlanData(result)
        setShowInput(false)
      } catch (error) {
        setParseError({
          message: "Failed to parse sample data",
          details: error instanceof Error ? error.message : "Unknown error occurred",
        })
      }
    })
  }, [])

  const handleNewPlan = useCallback(() => {
    setShowInput(true)
    setParseError(null)
    setPlanData(null)
  }, [])

  const changeSummary = useMemo(() => {
    if (!planData?.resource_changes?.length) {
      return { create: 0, update: 0, delete: 0, replace: 0 }
    }

    return planData.resource_changes.reduce(
      (acc, resource) => {
        acc[resource.action]++
        return acc
      },
      { create: 0, update: 0, delete: 0, replace: 0 },
    )
  }, [planData])

  if (showInput) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Terraform Plan Viewer</h1>
          <p className="text-gray-600">Paste your Terraform plan output below, or try the sample data.</p>
        </div>

        <PlanInput
          value={planInput}
          onChange={setPlanInput}
          onSubmit={handlePlanSubmit}
          onLoadSample={loadSampleData}
          error={parseError}
          isLoading={isPending}
        />
      </div>
    )
  }

  if (!planData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Plan Data</h2>
          <p className="text-gray-600 mb-4">Something went wrong loading the plan data.</p>
          <button
            onClick={handleNewPlan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load New Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <PlanSummary summary={changeSummary} onLoadNewPlan={handleNewPlan} />
      <ResourceList resources={planData.resource_changes} />
    </div>
  )
}
