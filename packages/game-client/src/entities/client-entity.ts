import { RawEntity } from "@shared/types/entity";
import { GameState } from "@/state";
import { Renderable } from "@/entities/util";
import { getPlayer } from "@/util/get-player";
import { renderInteractionText } from "@/util/interaction-text";
import { ClientEntityBase } from "@/extensions/client-entity";
import { ImageLoader } from "@/managers/asset";
import { ClientInteractive, ClientPositionable } from "@/extensions";

export abstract class ClientEntity extends ClientEntityBase implements Renderable {
  constructor(data: RawEntity, imageLoader: ImageLoader) {
    super(data, imageLoader);
  }

  abstract getZIndex(): number;

  protected renderInteractionText(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const myPlayer = getPlayer(gameState);
    const positionable = this.getExt(ClientPositionable);
    const interactive = this.getExt(ClientInteractive);

    if (myPlayer && interactive.getDisplayName()) {
      let text = `${interactive.getDisplayName()} (e)`;

      renderInteractionText(
        ctx,
        text,
        positionable.getCenterPosition(),
        positionable.getPosition(),
        myPlayer.getCenterPosition(),
        interactive.getOffset()
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (this.hasExt(ClientInteractive)) {
      this.renderInteractionText(ctx, gameState);
    }
  }
}
