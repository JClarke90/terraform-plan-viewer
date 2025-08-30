"use client"

import { memo } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"
import type { ParseError } from "../types/terraform"

interface PlanInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onLoadSample: () => void
  error: ParseError | null
  isLoading: boolean
}

export const PlanInput = memo(function PlanInput({
  value,
  onChange,
  onSubmit,
  onLoadSample,
  error,
  isLoading,
}: PlanInputProps) {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Terraform Plan Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your terraform plan output here..."
            className="w-full h-64 p-3 border-2 border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />

          <div className="flex gap-3">
            <Button onClick={onSubmit} disabled={!value.trim() || isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Parse Plan
                </>
              )}
            </Button>

            <Button onClick={onLoadSample} variant="outline" disabled={isLoading}>
              Load Sample Data
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">{error.message}</h4>
              {error.details && <p className="text-sm text-red-600">{error.details}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})
