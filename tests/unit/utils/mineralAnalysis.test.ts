import {
  determineMineralType,
  getMineralDescription,
  getMineralDisplayName,
} from "@/src/utils/mineralAnalysis"

describe("determineMineralType", () => {
  it("classifies high soil as cultivable soil", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["consolidated-soil", "consolidated-soil", "consolidated-soil", "sand", "bedrock"],
    })

    expect(result.mineralType).toBe("cultivable-soil")
    expect(result.extractionDifficulty).toBe("easy")
  })

  it("classifies sand + soil mix as water ice", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["sand", "sand", "sand", "consolidated-soil", "consolidated-soil"],
    })

    expect(result.mineralType).toBe("water-ice")
    expect(result.extractionDifficulty).toBe("moderate")
  })

  it("classifies bedrock + rocks as iron ore", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["bedrock", "bedrock", "bedrock", "big-rocks", "big-rocks"],
    })

    expect(result.mineralType).toBe("iron-ore")
    expect(result.extractionDifficulty).toBe("difficult")
  })

  it("classifies strong bedrock as aluminum", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["bedrock", "bedrock", "bedrock", "bedrock", "sand"],
    })

    expect(result.mineralType).toBe("aluminum")
    expect(result.extractionDifficulty).toBe("moderate")
  })

  it("classifies mixed bedrock as copper", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["bedrock", "bedrock", "bedrock", "sand", "consolidated-soil"],
    })

    expect(result.mineralType).toBe("copper")
    expect(result.estimatedQuantity).toBe("small")
  })

  it("classifies many rocks as gold", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["big-rocks", "big-rocks", "big-rocks", "bedrock", "sand"],
    })

    expect(result.mineralType).toBe("gold")
    expect(result.extractionDifficulty).toBe("extreme")
  })

  it("classifies mostly sand as silicate", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["sand", "sand", "sand", "bedrock", "Custom"],
    })

    expect(result.mineralType).toBe("silicate")
    expect(result.extractionDifficulty).toBe("easy")
  })

  it("classifies very high soil (>=80%) as cultivable abundant", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: [
        "consolidated-soil", "consolidated-soil", "consolidated-soil",
        "consolidated-soil", "consolidated-soil",
      ],
    })

    expect(result.mineralType).toBe("cultivable-soil")
    expect(result.estimatedQuantity).toBe("abundant")
  })

  it("classifies soil >= 70% (but <80%) as cultivable large", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: [
        "consolidated-soil", "consolidated-soil", "consolidated-soil",
        "consolidated-soil", "consolidated-soil", "consolidated-soil",
        "consolidated-soil", "sand", "bedrock", "Custom",
      ],
    })

    expect(result.mineralType).toBe("cultivable-soil")
    expect(result.estimatedQuantity).toBe("large")
  })

  it("classifies sand >= 70% + soil >= 20% as water ice large", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["sand", "sand", "sand", "sand", "sand", "sand", "sand", "consolidated-soil", "consolidated-soil", "Custom"],
    })

    expect(result.mineralType).toBe("water-ice")
    expect(result.estimatedQuantity).toBe("large")
  })

  it("classifies bedrock >=50% with rocks 20-29% as iron ore large", () => {
    // bedrock=60%, rocks=20%, sand=20% → bedrock>=50 branch, rocks>=20 but <30 → 'large'
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["bedrock", "bedrock", "bedrock", "big-rocks", "sand"],
    })

    expect(result.mineralType).toBe("iron-ore")
    expect(result.estimatedQuantity).toBe("large")
  })

  it("classifies bedrock >= 85% as aluminum large", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: [
        "bedrock", "bedrock", "bedrock", "bedrock", "bedrock",
        "bedrock", "bedrock", "bedrock", "bedrock", "sand",
      ],
    })

    expect(result.mineralType).toBe("aluminum")
    expect(result.estimatedQuantity).toBe("large")
  })

  it("classifies rocks 40-49% as gold small", () => {
    // rocks=40%, sand=60% → not bedrock>=50, rocks>=40 → gold. rocks<50 → small
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["big-rocks", "big-rocks", "sand", "sand", "sand"],
    })

    expect(result.mineralType).toBe("gold")
    expect(result.estimatedQuantity).toBe("small")
  })

  it("classifies sand 40-59% (no soil) as silicate moderate", () => {
    // sand=40%, Custom=60% → sand>=40 branch, sand<60 → 'moderate'
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["sand", "sand", "Custom", "Custom", "Custom"],
    })

    expect(result.mineralType).toBe("silicate")
    expect(result.estimatedQuantity).toBe("moderate")
  })

  it("handles empty categories array using the length || 1 fallback", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: [],
    })

    expect(result.mineralType).toBe("silicate")
    expect(result.estimatedQuantity).toBe("trace")
    expect(result.confidence).toBe(20) // totalAnnotations falls back to 1 via ||1, so (1/5)*100=20
  })

  it("skips unknown category values in accumulation", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["unknown-category" as any],
    })

    expect(result.mineralType).toBe("silicate")
    expect(result.estimatedQuantity).toBe("trace")
  })

  it("uses default mixed terrain fallback and computes confidence", () => {
    const result = determineMineralType({
      annotationOptions: [],
      categories: ["Custom"],
    })

    expect(result.mineralType).toBe("silicate")
    expect(result.estimatedQuantity).toBe("trace")
    expect(result.confidence).toBe(20)
  })
})

describe("mineral display helpers", () => {
  it("returns readable names and descriptions", () => {
    expect(getMineralDisplayName("water-ice")).toBe("Water Ice")
    expect(getMineralDescription("gold")).toContain("Rare precious metal")
  })
})
