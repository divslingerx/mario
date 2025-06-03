/**
 * Modular pawn sprite generator - creates unique characters from parts
 */

export interface PawnAppearance {
  bodyType: 'adult' | 'child'
  bodyBuild: 'thin' | 'average' | 'stocky'
  gender: 'male' | 'female' | 'neutral'
  skinTone: string
  hairStyle: string
  hairColor: string
  clothingColor: string
  clothingStyle: 'jumpsuit' | 'casual' | 'armor' | 'lab_coat' | 'ragged'
  accessories: string[]
}

export class PawnSprite {
  // Skin tone palette
  static readonly SKIN_TONES = [
    '#fdbcb4', // Light peach
    '#f5deb3', // Wheat
    '#daa520', // Goldenrod
    '#cd853f', // Peru
    '#8b4513', // Saddle brown
    '#654321', // Dark brown
  ]
  
  // Hair colors
  static readonly HAIR_COLORS = [
    '#2c1810', // Black
    '#3b2219', // Dark brown
    '#8b4513', // Brown
    '#d2691e', // Light brown
    '#ffd700', // Blonde
    '#dc143c', // Red
    '#808080', // Gray
    '#e6e6fa', // White
    '#4b0082', // Purple (dyed)
    '#00ced1', // Blue (dyed)
  ]
  
  // Clothing colors by style
  static readonly CLOTHING_COLORS = {
    jumpsuit: ['#4a5568', '#2563eb', '#059669', '#7c3aed'],
    casual: ['#60a5fa', '#34d399', '#f59e0b', '#ec4899'],
    armor: ['#374151', '#6b7280', '#111827', '#4b5563'],
    lab_coat: ['#f9fafb', '#e5e7eb', '#d1d5db'],
    ragged: ['#92400e', '#78350f', '#451a03', '#713f12']
  }
  
  /**
   * Generate random appearance
   */
  static generateRandomAppearance(): PawnAppearance {
    const bodyType = Math.random() > 0.9 ? 'child' : 'adult'
    const builds = ['thin', 'average', 'stocky'] as const
    const genders = ['male', 'female', 'neutral'] as const
    const styles = ['jumpsuit', 'casual', 'armor', 'lab_coat', 'ragged'] as const
    const hairStyles = ['short', 'long', 'mohawk', 'bald', 'ponytail', 'messy', 'buzz']
    
    const clothingStyle = styles[Math.floor(Math.random() * styles.length)]
    const clothingColors = this.CLOTHING_COLORS[clothingStyle]
    
    const appearance: PawnAppearance = {
      bodyType,
      bodyBuild: builds[Math.floor(Math.random() * builds.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
      skinTone: this.SKIN_TONES[Math.floor(Math.random() * this.SKIN_TONES.length)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      hairColor: this.HAIR_COLORS[Math.floor(Math.random() * this.HAIR_COLORS.length)],
      clothingColor: clothingColors[Math.floor(Math.random() * clothingColors.length)],
      clothingStyle,
      accessories: this.generateAccessories()
    }
    
    return appearance
  }
  
  /**
   * Generate random accessories
   */
  static generateAccessories(): string[] {
    const accessories: string[] = []
    const possibleAccessories = [
      'glasses', 'goggles', 'eyepatch', 'scar', 'beard', 
      'backpack', 'helmet', 'mask', 'gloves', 'boots'
    ]
    
    // Add 0-3 accessories
    const count = Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const accessory = possibleAccessories[Math.floor(Math.random() * possibleAccessories.length)]
      if (!accessories.includes(accessory)) {
        accessories.push(accessory)
      }
    }
    
    return accessories
  }
  
  /**
   * Draw pawn with given appearance
   */
  static draw(
    context: CanvasRenderingContext2D, 
    appearance: PawnAppearance,
    x: number,
    y: number,
    scale: number = 1,
    facing: 'left' | 'right' = 'right'
  ): void {
    context.save()
    context.translate(x, y)
    context.scale(scale * (facing === 'left' ? -1 : 1), scale)
    
    const isChild = appearance.bodyType === 'child'
    const heightMod = isChild ? 0.8 : 1
    const widthMod = appearance.bodyBuild === 'thin' ? 0.9 : 
                     appearance.bodyBuild === 'stocky' ? 1.2 : 1
    
    // Draw shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    context.beginPath()
    context.ellipse(0, 18 * heightMod, 12 * widthMod, 4, 0, 0, Math.PI * 2)
    context.fill()
    
    // Draw legs
    this.drawLegs(context, appearance, heightMod, widthMod)
    
    // Draw body
    this.drawBody(context, appearance, heightMod, widthMod)
    
    // Draw arms
    this.drawArms(context, appearance, heightMod, widthMod)
    
    // Draw head
    this.drawHead(context, appearance, heightMod)
    
    // Draw hair
    this.drawHair(context, appearance, heightMod)
    
    // Draw accessories
    this.drawAccessories(context, appearance, heightMod, widthMod)
    
    context.restore()
  }
  
  private static drawLegs(
    context: CanvasRenderingContext2D,
    appearance: PawnAppearance,
    heightMod: number,
    widthMod: number
  ): void {
    // Leg color (pants or skin for shorts)
    const legColor = appearance.clothingStyle === 'casual' && Math.random() > 0.5 
      ? appearance.skinTone 
      : appearance.clothingColor
    
    context.fillStyle = legColor
    
    // Left leg
    context.fillRect(-5 * widthMod, 8 * heightMod, 4 * widthMod, 10 * heightMod)
    
    // Right leg
    context.fillRect(1 * widthMod, 8 * heightMod, 4 * widthMod, 10 * heightMod)
    
    // Shoes
    if (appearance.accessories.includes('boots')) {
      context.fillStyle = '#1f2937'
      context.fillRect(-6 * widthMod, 16 * heightMod, 5 * widthMod, 4)
      context.fillRect(1 * widthMod, 16 * heightMod, 5 * widthMod, 4)
    } else {
      context.fillStyle = '#4b5563'
      context.fillRect(-5 * widthMod, 17 * heightMod, 4 * widthMod, 3)
      context.fillRect(1 * widthMod, 17 * heightMod, 4 * widthMod, 3)
    }
  }
  
  private static drawBody(
    context: CanvasRenderingContext2D,
    appearance: PawnAppearance,
    heightMod: number,
    widthMod: number
  ): void {
    context.fillStyle = appearance.clothingColor
    
    // Main torso
    const bodyWidth = 12 * widthMod
    const bodyHeight = 14 * heightMod
    context.fillRect(-bodyWidth/2, -6 * heightMod, bodyWidth, bodyHeight)
    
    // Clothing details
    if (appearance.clothingStyle === 'armor') {
      // Armor plates
      context.strokeStyle = '#1f2937'
      context.lineWidth = 1
      context.strokeRect(-bodyWidth/2 + 2, -4 * heightMod, bodyWidth - 4, 10 * heightMod)
    } else if (appearance.clothingStyle === 'lab_coat') {
      // Lab coat buttons
      context.fillStyle = '#374151'
      for (let i = 0; i < 3; i++) {
        context.fillRect(-1, -3 * heightMod + i * 3, 2, 2)
      }
    }
    
    // Backpack
    if (appearance.accessories.includes('backpack')) {
      context.fillStyle = '#92400e'
      context.fillRect(-bodyWidth/2 - 3, -4 * heightMod, 3, 8 * heightMod)
    }
  }
  
  private static drawArms(
    context: CanvasRenderingContext2D,
    appearance: PawnAppearance,
    heightMod: number,
    widthMod: number
  ): void {
    const armColor = appearance.clothingStyle === 'casual' && Math.random() > 0.7
      ? appearance.skinTone
      : appearance.clothingColor
    
    context.fillStyle = armColor
    
    // Left arm
    context.fillRect(-8 * widthMod, -6 * heightMod, 3 * widthMod, 10 * heightMod)
    
    // Right arm
    context.fillRect(5 * widthMod, -6 * heightMod, 3 * widthMod, 10 * heightMod)
    
    // Hands
    context.fillStyle = appearance.skinTone
    if (!appearance.accessories.includes('gloves')) {
      context.fillRect(-8 * widthMod, 3 * heightMod, 3 * widthMod, 3)
      context.fillRect(5 * widthMod, 3 * heightMod, 3 * widthMod, 3)
    } else {
      context.fillStyle = '#1f2937'
      context.fillRect(-8 * widthMod, 3 * heightMod, 3 * widthMod, 3)
      context.fillRect(5 * widthMod, 3 * heightMod, 3 * widthMod, 3)
    }
  }
  
  private static drawHead(
    context: CanvasRenderingContext2D,
    appearance: PawnAppearance,
    heightMod: number
  ): void {
    // Head shape based on gender/build
    context.fillStyle = appearance.skinTone
    const headSize = 8 * heightMod
    const headY = -16 * heightMod
    
    if (appearance.gender === 'male' && appearance.bodyBuild === 'stocky') {
      // Square jaw
      context.fillRect(-headSize/2, headY, headSize, headSize)
    } else {
      // Rounded head
      context.beginPath()
      context.arc(0, headY + headSize/2, headSize/2, 0, Math.PI * 2)
      context.fill()
    }
    
    // Eyes
    const eyeY = headY + 3
    const eyeSpacing = 2
    
    if (appearance.accessories.includes('eyepatch')) {
      // One eye with patch
      context.fillStyle = '#1f2937'
      context.fillRect(-eyeSpacing - 1, eyeY, 3, 3)
      
      // Eyepatch
      context.fillStyle = '#000000'
      context.fillRect(eyeSpacing - 1, eyeY - 1, 4, 4)
      context.strokeStyle = '#000000'
      context.lineWidth = 0.5
      context.beginPath()
      context.moveTo(eyeSpacing + 3, eyeY + 1)
      context.lineTo(headSize/2, eyeY - 2)
      context.stroke()
    } else {
      // Normal eyes
      context.fillStyle = '#1f2937'
      context.fillRect(-eyeSpacing - 1, eyeY, 2, 2)
      context.fillRect(eyeSpacing, eyeY, 2, 2)
      
      // Glasses
      if (appearance.accessories.includes('glasses')) {
        context.strokeStyle = '#374151'
        context.lineWidth = 1
        context.strokeRect(-eyeSpacing - 2, eyeY - 1, 4, 4)
        context.strokeRect(eyeSpacing - 1, eyeY - 1, 4, 4)
        context.beginPath()
        context.moveTo(-eyeSpacing + 2, eyeY + 1)
        context.lineTo(eyeSpacing - 1, eyeY + 1)
        context.stroke()
      }
    }
    
    // Scar
    if (appearance.accessories.includes('scar')) {
      context.strokeStyle = '#dc2626'
      context.lineWidth = 0.5
      context.beginPath()
      context.moveTo(-3, eyeY - 1)
      context.lineTo(-1, eyeY + 3)
      context.stroke()
    }
    
    // Mouth (simple line)
    context.strokeStyle = '#92400e'
    context.lineWidth = 0.5
    context.beginPath()
    context.moveTo(-2, headY + headSize - 2)
    context.lineTo(2, headY + headSize - 2)
    context.stroke()
    
    // Beard
    if (appearance.accessories.includes('beard') && appearance.gender === 'male') {
      context.fillStyle = appearance.hairColor
      context.fillRect(-3, headY + headSize - 3, 6, 3)
    }
  }
  
  private static drawHair(
    context: CanvasRenderingContext2D,
    appearance: PawnAppearance,
    heightMod: number
  ): void {
    if (appearance.hairStyle === 'bald') return
    
    context.fillStyle = appearance.hairColor
    const headY = -16 * heightMod
    
    switch (appearance.hairStyle) {
      case 'short':
        context.fillRect(-4, headY - 2, 8, 4)
        context.fillRect(-5, headY, 10, 2)
        break
        
      case 'long':
        context.fillRect(-5, headY - 2, 10, 12)
        context.fillRect(-6, headY, 12, 8)
        break
        
      case 'mohawk':
        context.fillRect(-1, headY - 4, 2, 8)
        context.fillRect(-2, headY - 2, 4, 4)
        break
        
      case 'ponytail':
        context.fillRect(-4, headY - 2, 8, 6)
        context.fillRect(-6, headY + 2, 3, 8)
        break
        
      case 'messy':
        context.fillRect(-5, headY - 3, 10, 5)
        context.fillRect(-4, headY - 1, 3, 7)
        context.fillRect(1, headY - 1, 3, 7)
        break
        
      case 'buzz':
        context.fillRect(-4, headY - 1, 8, 3)
        break
    }
    
    // Helmet covers hair
    if (appearance.accessories.includes('helmet')) {
      context.fillStyle = '#6b7280'
      context.fillRect(-5, headY - 3, 10, 8)
      context.fillStyle = '#374151'
      context.fillRect(-4, headY - 2, 8, 1)
    }
  }
  
  private static drawAccessories(
    context: CanvasRenderingContext2D,
    appearance: PawnAppearance,
    heightMod: number,
    widthMod: number
  ): void {
    // Goggles (on forehead if not over eyes)
    if (appearance.accessories.includes('goggles') && !appearance.accessories.includes('glasses')) {
      context.fillStyle = '#1f2937'
      context.fillRect(-5, -18 * heightMod, 10, 3)
      context.fillStyle = '#3b82f6'
      context.fillRect(-4, -17 * heightMod, 3, 2)
      context.fillRect(1, -17 * heightMod, 3, 2)
    }
    
    // Mask (lower face)
    if (appearance.accessories.includes('mask')) {
      context.fillStyle = '#1f2937'
      context.fillRect(-4, -10 * heightMod, 8, 5)
    }
  }
}