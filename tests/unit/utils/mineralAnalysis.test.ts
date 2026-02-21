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
