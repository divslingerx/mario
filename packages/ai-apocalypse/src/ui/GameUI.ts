import { Entity } from '@js2d/engine'
import { WeaponTrait } from '../traits/WeaponTrait'

/**
 * UI rendering for the game HUD
 */
export class GameUI {
  draw(context: CanvasRenderingContext2D, player: Entity, inputState: any): void {
    this.drawWeaponStatus(context, player)
    this.drawControlsHint(context)
  }

  private drawWeaponStatus(context: CanvasRenderingContext2D, player: Entity): void {
    const weapon = player.getTrait(WeaponTrait)
    if (!weapon) return

    const status = weapon.getWeaponStatus()
    if (!status?.weapon) return

    context.save()
    
    // Weapon name
    context.fillStyle = '#ffffff'
    context.font = '16px sans-serif'
    context.fillText(status.weapon.name, 10, 30)
    
    // Energy bar
    context.fillStyle = '#374151'
    context.fillRect(10, 40, 200, 10)
    context.fillStyle = '#3b82f6'
    context.fillRect(10, 40, (status.energyPercent / 100) * 200, 10)
    
    // Cooldown indicator
    if (status.cooldownPercent > 0) {
      context.fillStyle = '#ef4444'
      context.fillRect(10, 52, (status.cooldownPercent / 100) * 200, 2)
    }
    
    context.restore()
  }

  private drawControlsHint(context: CanvasRenderingContext2D): void {
    context.save()
    context.fillStyle = '#ffffff'
    context.font = '12px sans-serif'
    context.fillText('Arrow Keys/WASD: Move | Space/Z: Jump/Fire | Tab: Switch Weapon', 10, 580)
    context.restore()
  }
}