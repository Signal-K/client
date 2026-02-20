import { AI4MCategory } from "@/types/Annotation";

type MineralType = 'iron-ore' | 'cultivable-soil' | 'gold' | 'aluminum' | 'water-ice' | 'silicate' | 'copper';

interface MineralConfiguration {
  mineralType: MineralType;
  purity: number;
  estimatedQuantity: 'trace' | 'small' | 'moderate' | 'large' | 'abundant';
  extractionDifficulty: 'easy' | 'moderate' | 'difficult' | 'extreme';
  confidence: number;
}

interface ClassificationData {
  annotationOptions: string[];
  categories: AI4MCategory[];
}

/**
 * Determines mineral type based on AI4Mars terrain classifications
 */
export function determineMineralType(classificationData: ClassificationData): MineralConfiguration {
  const { annotationOptions, categories } = classificationData;
  
  // Count occurrences of each category
  const categoryCounts: Record<AI4MCategory, number> = {
    'sand': 0,
    'consolidated-soil': 0,
    'bedrock': 0,
    'big-rocks': 0,
    'Custom': 0
  };
  
  categories.forEach(cat => {
    if (cat in categoryCounts) categoryCounts[cat]++;
  });
  
  const totalAnnotations = categories.length || 1; // Prevent division by zero
  
  // Calculate percentages
  const sandPercent = (categoryCounts['sand'] / totalAnnotations) * 100;
  const soilPercent = (categoryCounts['consolidated-soil'] / totalAnnotations) * 100;
  const bedrockPercent = (categoryCounts['bedrock'] / totalAnnotations) * 100;
  const rocksPercent = (categoryCounts['big-rocks'] / totalAnnotations) * 100;
  
  let mineralType: MineralType;
  let purity: number;
  let estimatedQuantity: 'trace' | 'small' | 'moderate' | 'large' | 'abundant';
  let extractionDifficulty: 'easy' | 'moderate' | 'difficult' | 'extreme';
  
  // Determination logic
  if (soilPercent >= 60) {
    // High soil content = cultivable regolith
    mineralType = 'cultivable-soil';
    purity = Math.min(90, soilPercent + 10);
    estimatedQuantity = soilPercent >= 80 ? 'abundant' : soilPercent >= 70 ? 'large' : 'moderate';
    extractionDifficulty = 'easy';
  } else if (sandPercent >= 50 && soilPercent >= 20) {
    // Mix of sand and soil = water ice potential (fine particles trap ice)
    mineralType = 'water-ice';
    purity = Math.min(85, (sandPercent + soilPercent) / 2);
    estimatedQuantity = sandPercent >= 70 ? 'large' : sandPercent >= 50 ? 'moderate' : 'small';
    extractionDifficulty = 'moderate';
  } else if (bedrockPercent >= 50) {
    // Bedrock deposits - mineral ore based on rock percentage
    if (rocksPercent >= 20) {
      // Large rocks + bedrock = iron ore
      mineralType = 'iron-ore';
      purity = Math.min(95, bedrockPercent + rocksPercent);
      estimatedQuantity = rocksPercent >= 30 ? 'abundant' : rocksPercent >= 20 ? 'large' : 'moderate';
      extractionDifficulty = 'difficult';
    } else if (bedrockPercent >= 70) {
      // Pure bedrock = aluminum/silicate
      mineralType = 'aluminum';
      purity = Math.min(80, bedrockPercent);
      estimatedQuantity = bedrockPercent >= 85 ? 'large' : 'moderate';
      extractionDifficulty = 'moderate';
    } else {
      // Mixed bedrock = copper/silicate minerals
      mineralType = 'copper';
      purity = Math.min(70, bedrockPercent);
      estimatedQuantity = 'small';
      extractionDifficulty = 'difficult';
    }
  } else if (rocksPercent >= 40) {
    // Lots of big rocks = rare metals (gold)
    mineralType = 'gold';
    purity = Math.min(60, rocksPercent + 20);
    estimatedQuantity = rocksPercent >= 50 ? 'moderate' : 'small';
    extractionDifficulty = 'extreme';
  } else if (sandPercent >= 40) {
    // Mostly sand = silicate minerals
    mineralType = 'silicate';
    purity = Math.min(75, sandPercent + 15);
    estimatedQuantity = sandPercent >= 60 ? 'large' : 'moderate';
    extractionDifficulty = 'easy';
  } else {
    // Default mixed terrain
    mineralType = 'silicate';
    purity = 50;
    estimatedQuantity = 'trace';
    extractionDifficulty = 'moderate';
  }
  
  // Confidence based on number of annotations
  const confidence = Math.min(100, (totalAnnotations / 5) * 100);
  
  return {
    mineralType,
    purity: Math.round(purity),
    estimatedQuantity,
    extractionDifficulty,
    confidence: Math.round(confidence)
  };
}

export function getMineralDisplayName(type: MineralType): string {
  const names: Record<MineralType, string> = {
    'iron-ore': 'Iron Ore',
    'cultivable-soil': 'Cultivable Regolith',
    'gold': 'Gold Deposits',
    'aluminum': 'Aluminum Ore',
    'water-ice': 'Water Ice',
    'silicate': 'Silicate Minerals',
    'copper': 'Copper Ore'
  };
  return names[type];
}

export function getMineralDescription(type: MineralType): string {
  const descriptions: Record<MineralType, string> = {
    'iron-ore': 'Essential for construction and manufacturing. High demand for base infrastructure.',
    'cultivable-soil': 'Processed regolith suitable for agriculture. Critical for food production.',
    'gold': 'Rare precious metal. Valuable for electronics and trade.',
    'aluminum': 'Lightweight structural material. Important for spacecraft and habitats.',
    'water-ice': 'Frozen water deposits. Essential for life support and fuel production.',
    'silicate': 'Common mineral compounds. Useful for glass, ceramics, and construction.',
    'copper': 'Conductive metal. Needed for electrical systems and wiring.'
  };
  return descriptions[type];
}
