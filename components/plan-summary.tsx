"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Plus, Minus, Repeat, FileText } from "lucide-react"
import { TildeIcon } from "./icons/tilde-icon"

interface PlanSummaryProps {
  summary: {
    create: number
    update: number
    delete: number
    replace: number
  }
  onLoadNewPlan: () => void
}

export const PlanSummary = memo(function PlanSummary({ summary, onLoadNewPlan }: PlanSummaryProps) {
  const total = summary.create + summary.update + summary.delete + summary.replace

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Terraform Plan Summary
        </h1>
        <Button onClick={onLoadNewPlan} variant="outline">
          Load New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Create
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.create}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-1">
              <TildeIcon className="w-4 h-4" />
              Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "rgb(51, 172, 234)" }}>
              {summary.update}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-1">
              <Minus className="w-4 h-4" />
              Delete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "rgb(230, 10, 10)" }}>
              {summary.delete}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-1">
              <Repeat className="w-4 h-4" />
              Replace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "rgb(240, 140, 88)" }}>
              {summary.replace}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
