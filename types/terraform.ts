export interface TerraformAttribute {
  key: string
  value: any
  action: string
  change: {
    from: any
    to: any
  } | null
}

export interface TerraformBlock {
  name: string
  action: string
  attributes: TerraformAttribute[]
  indent: number
  comment?: string
  isSensitive?: boolean
  isSingleLine?: boolean
}

export interface TerraformResource {
  address: string
  displayName: string
  uniqueId: string
  type: string
  name: string
  index: string | null
  action: "create" | "update" | "delete" | "replace"
  attributes: Record<string, TerraformAttribute>
  changes: Record<string, any>
  blocks: TerraformBlock[]
}

export interface TerraformPlan {
  resource_changes: TerraformResource[]
}

export interface ChangeSummary {
  create: number
  update: number
  delete: number
  replace: number
}

export interface ParseError {
  message: string
  details?: string
}
