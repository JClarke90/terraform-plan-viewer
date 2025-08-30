import type { TerraformPlan, TerraformResource, TerraformAttribute, TerraformBlock } from "../types/terraform"

function cleanPlanText(planText: string): string {
  return planText
    .split("\n")
    .map((line) => {
      // Remove timestamps and common prefixes
      line = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s+/, "")
      line = line.replace(/^##\[section\]/, "")
      line = line.replace(/^##\[command\]/, "")
      return line
    })
    .join("\n")
}

function parseResourceComment(line: string) {
  const commentPatterns = [
    /^\s*#\s+([^.\s]+)\.([^.\s[]+)(?:\[([^\]]+)\])?\s+(.+)$/,
    /^\s*#\s+([^.\s]+)\.([^.\s[]+)\s+(.+)$/,
  ]

  for (const pattern of commentPatterns) {
    const commentMatch = line.match(pattern)
    if (commentMatch) {
      const [, resourceType, resourceName, indexOrDescription, description] = commentMatch
      return {
        type: resourceType,
        name: resourceName,
        index: indexOrDescription && !indexOrDescription.includes(" ") ? indexOrDescription : null,
        description: description || indexOrDescription,
      }
    }
  }
  return null
}

function parseResourceDeclaration(line: string) {
  const resourcePatterns = [
    /^\s*([+~-]|[-/+]+)\s*resource\s+"([^"]+)"\s+"([^"]+)"\s*\{?\s*$/,
    /^\s*([+~-]|[-/+]+)\s*resource\s+([^\s]+)\s+([^\s{]+)\s*\{?\s*$/,
    /^\s*([+~-]|[-/+]+)\s+resource\s+"([^"]+)"\s+"([^"]+)"\s*\{?\s*$/,
  ]

  for (const pattern of resourcePatterns) {
    const resourceMatch = line.match(pattern)
    if (resourceMatch) {
      return resourceMatch
    }
  }
  return null
}

function createResource(
  resourceMatch: RegExpMatchArray,
  pendingResourceInfo: any,
  resourceCount: number,
): TerraformResource {
  const [, action, resourceType, resourceName] = resourceMatch
  const actionName = mapActionSymbol(action)
  const resourceAddress = `${resourceType}.${resourceName}`

  let uniqueId = resourceAddress
  let displayName = resourceAddress

  if (pendingResourceInfo && pendingResourceInfo.index !== null) {
    displayName = `${resourceAddress}[${pendingResourceInfo.index}]`
    uniqueId = `${resourceAddress}[${pendingResourceInfo.index}]`
  } else {
    uniqueId = `${resourceAddress}_${resourceCount}`
  }

  return {
    address: resourceAddress,
    displayName: displayName,
    uniqueId: uniqueId,
    type: resourceType,
    name: resourceName,
    index: pendingResourceInfo?.index || null,
    action: actionName,
    attributes: {},
    changes: {},
    blocks: [],
  }
}

const SKIP_PATTERNS = [
  /^$/,
  /^Terraform used/,
  /^Resource actions/,
  /^Terraform will perform/,
  /^Plan:/,
  /^Warning:/,
  /^Note:/,
  /unchanged attributes hidden/,
  /unchanged blocks hidden/,
  /Reading\.\.\./,
  /Refreshing state\.\.\./,
  /Read complete/,
  /can't guarantee to take exactly/,
  /^─────────/,
  /^##\[section\]/,
  /^##\[warning\]/,
  /^==============/,
  /^Task/,
  /^Description/,
  /^Version/,
  /^Author/,
  /^Help/,
  /^\[command\]/,
  /^Changes to Outputs:/,
  /^You can apply this plan/,
  /^To perform exactly these actions/,
]

function shouldSkipLine(trimmedLine: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(trimmedLine))
}

function mapActionSymbol(action: string): "create" | "update" | "delete" | "replace" {
  const actionMap: Record<string, "create" | "update" | "delete" | "replace"> = {
    "+": "create",
    "~": "update",
    "-": "delete",
    "-/+": "replace",
    "±": "replace",
  }

  return actionMap[action.trim()] || "create"
}

export function parseTerraformPlan(planText: string): TerraformPlan {
  const cleanedText = cleanPlanText(planText)
  const lines = cleanedText.split("\n")
  const resources: TerraformResource[] = []

  let currentResource: TerraformResource | null = null
  let insideResource = false
  let currentBlock: TerraformBlock | null = null
  let blockStack: TerraformBlock[] = []
  let pendingResourceInfo: any = null
  let parsingArray = false
  let arrayKey: string | null = null
  let arrayItems: any[] = []
  let arrayChangeSymbol = ""
  let nestedArrayDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (shouldSkipLine(trimmedLine)) {
      continue
    }

    if (parsingArray) {
      const arrayResult = handleArrayParsing(
        line,
        trimmedLine,
        arrayItems,
        arrayKey!,
        arrayChangeSymbol,
        currentBlock,
        currentResource,
        nestedArrayDepth,
      )

      if (arrayResult.shouldContinue) {
        arrayItems = arrayResult.arrayItems
        nestedArrayDepth = arrayResult.nestedArrayDepth
        continue
      } else {
        parsingArray = false
        arrayKey = null
        arrayItems = []
        arrayChangeSymbol = ""
        nestedArrayDepth = 0
        continue
      }
    }

    // Detect resource comment lines
    const commentMatch = parseResourceComment(line)
    if (commentMatch) {
      pendingResourceInfo = commentMatch
      continue
    }

    // Detect resource declaration lines
    const resourceMatch = parseResourceDeclaration(line)
    if (resourceMatch) {
      if (currentResource) {
        resources.push(currentResource)
      }

      currentResource = createResource(resourceMatch, pendingResourceInfo, resources.length)
      insideResource = true
      currentBlock = null
      blockStack = []
      pendingResourceInfo = null
      continue
    }

    if (!insideResource) continue

    // Check if we're at the end of the resource
    if (trimmedLine === "}" && line.search(/\S/) <= 6) {
      if (blockStack.length === 0) {
        if (currentResource) {
          resources.push(currentResource)
        }
        insideResource = false
        currentResource = null
        currentBlock = null
        continue
      } else {
        if (currentBlock) {
          currentResource!.blocks.push(currentBlock)
        }
        blockStack.pop()
        currentBlock = blockStack.length > 0 ? blockStack[blockStack.length - 1] : null
        continue
      }
    }

    // Handle block declarations
    const blockMatch = line.match(/^\s*([+~-]?)\s*([^{]+?)\s*\{\s*$/)
    if (blockMatch) {
      const [, changeSymbol, blockName] = blockMatch
      const cleanBlockName = blockName.trim()

      // For nested blocks that are part of resource creation, don't inherit the parent's action
      let blockAction = ""
      if (changeSymbol && changeSymbol.trim()) {
        // Only assign action if there's an explicit change symbol on the block line itself
        // and it's not just indentation from being inside a resource creation
        const lineIndent = line.search(/\S/)
        const hasExplicitChangeSymbol = line.trim().startsWith(changeSymbol)

        if (hasExplicitChangeSymbol && lineIndent > 6) {
          blockAction = changeSymbol
        }
      }

      const newBlock: TerraformBlock = {
        name: cleanBlockName,
        action: blockAction,
        attributes: [],
        indent: line.search(/\S/),
      }

      blockStack.push(newBlock)
      currentBlock = newBlock
      continue
    }

    // Handle sensitive block detection
    if (trimmedLine.includes("At least one attribute in this block is") && trimmedLine.includes("sensitive")) {
      if (currentBlock) {
        currentBlock.isSensitive = true
      }
      continue
    }

    // Handle array start
    const arrayStartMatch = line.match(/^\s*([+~-]?)\s*([^=]+?)\s*=\s*\[\s*$/)
    if (arrayStartMatch) {
      const [, changeSymbol, key] = arrayStartMatch
      arrayKey = key.trim().replace(/"/g, "")
      arrayChangeSymbol = changeSymbol || ""
      parsingArray = true
      arrayItems = []
      nestedArrayDepth = 0
      continue
    }

    // Parse regular attributes
    if (currentResource && trimmedLine && !trimmedLine.startsWith("#")) {
      const attribute = parseAttribute(line)
      if (attribute) {
        if (currentBlock) {
          currentBlock.attributes.push(attribute)
        } else {
          currentResource.attributes[attribute.key] = attribute
        }
      }
    }
  }

  // Don't forget the last resource
  if (currentResource) {
    resources.push(currentResource)
  }

  return { resource_changes: resources }
}

function handleArrayParsing(
  line: string,
  trimmedLine: string,
  arrayItems: any[],
  arrayKey: string,
  arrayChangeSymbol: string,
  currentBlock: TerraformBlock | null,
  currentResource: TerraformResource | null,
  nestedArrayDepth: number,
) {
  // Count opening and closing brackets/braces
  const openBrackets = (line.match(/\[/g) || []).length
  const closeBrackets = (line.match(/\]/g) || []).length
  const openBraces = (line.match(/\{/g) || []).length
  const closeBraces = (line.match(/\}/g) || []).length

  const newNestedDepth = nestedArrayDepth + openBrackets + openBraces - closeBrackets - closeBraces

  // Check for array closing
  if (
    (trimmedLine === "]" ||
      trimmedLine.match(/^\s*\]\s*->\s*$$known after apply$$\s*$/) ||
      trimmedLine.match(/^\s*\]\s*->\s*.+$/)) &&
    newNestedDepth <= 0
  ) {
    const attribute: TerraformAttribute = {
      key: arrayKey,
      value: arrayItems.length > 0 ? arrayItems : [],
      action: arrayChangeSymbol,
      change: null,
    }

    if (trimmedLine.includes(" -> ")) {
      const afterPart = trimmedLine.split(" -> ")[1].trim()
      attribute.change = { from: arrayItems, to: afterPart }
      attribute.value = { from: arrayItems, to: afterPart }
    }

    if (currentBlock) {
      currentBlock.attributes.push(attribute)
    } else if (currentResource) {
      currentResource.attributes[arrayKey] = attribute
    }

    return {
      shouldContinue: false,
      arrayItems,
      nestedArrayDepth: 0,
    }
  }

  // Handle array items
  if (trimmedLine && !trimmedLine.startsWith("]") && !trimmedLine.endsWith("}")) {
    const changeMatch = line.match(/^\s*([+~-]?)\s*(.*)$/)
    if (changeMatch) {
      const [, changeSymbol, content] = changeMatch
      let cleanContent = content.trim()

      // Clean up quotes and commas
      if (cleanContent.startsWith('"') && cleanContent.endsWith('",')) {
        cleanContent = cleanContent.slice(1, -2)
      } else if (cleanContent.startsWith('"') && cleanContent.endsWith('"')) {
        cleanContent = cleanContent.slice(1, -1)
      } else if (cleanContent.endsWith(",")) {
        cleanContent = cleanContent.slice(0, -1).trim()
      }

      if (cleanContent && cleanContent !== "]" && cleanContent !== "}") {
        const itemWithSymbol = changeSymbol ? `${changeSymbol} ${cleanContent}` : cleanContent
        arrayItems.push(itemWithSymbol)
      }
    }
  }

  return {
    shouldContinue: true,
    arrayItems,
    nestedArrayDepth: newNestedDepth,
  }
}

function parseAttribute(line: string): TerraformAttribute | null {
  const attrPatterns = [/^\s*([+~-]?)\s*([^=]+?)\s*=\s*(.+)$/, /^\s*([+~-]?)\s*"([^"]+)"\s*=\s*(.+)$/]

  let attrMatch = null
  for (const pattern of attrPatterns) {
    attrMatch = line.match(pattern)
    if (attrMatch) break
  }

  if (!attrMatch) return null

  const [, changeSymbol, key, value] = attrMatch
  const cleanKey = key.trim().replace(/"/g, "")
  let cleanValue = value.trim()

  if (cleanValue.endsWith(",")) {
    cleanValue = cleanValue.slice(0, -1).trim()
  }

  const parsedValue = parseValue(cleanValue)

  const attribute: TerraformAttribute = {
    key: cleanKey,
    value: parsedValue,
    action: changeSymbol || "",
    change: null,
  }

  // Handle change syntax (value1 -> value2)
  if (changeSymbol === "~" && typeof parsedValue === "string" && parsedValue.includes(" -> ")) {
    const parts = parsedValue.split(" -> ")
    if (parts.length === 2) {
      const before = parts[0].trim().replace(/"/g, "")
      const after = parts[1].trim().replace(/"/g, "")
      attribute.change = { from: before, to: after }
      attribute.value = { from: before, to: after }
    }
  }

  return attribute
}

function parseValue(cleanValue: string): any {
  if (cleanValue === "(known after apply)") return "(known after apply)"
  if (cleanValue === "true") return true
  if (cleanValue === "false") return false
  if (cleanValue === "null") return null

  if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
    return cleanValue.slice(1, -1)
  }

  if (!isNaN(Number(cleanValue)) && cleanValue !== "" && !cleanValue.includes(" ")) {
    return Number(cleanValue)
  }

  return cleanValue
}
