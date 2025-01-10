import { Entity } from "../entity";
import { Extension, ExtensionSerialized } from "./types";
import { Player } from "../entities/player";

type ConsumableHandler = (player: Player, idx: number) => void;

export default class Consumable implements Extension {
  public static readonly type = "consumable";

  private self: Entity;
  private handler: ConsumableHandler | null = null;

  public constructor(self: Entity) {
    this.self = self;
  }

  public onConsume(handler: ConsumableHandler): this {
    this.handler = handler;
    return this;
  }

  public consume(player: Player, idx: number): void {
    this.handler?.(player, idx);
  }

  public deserialize(data: ExtensionSerialized): this {
    return this;
  }

  public serialize(): ExtensionSerialized {
    return {
      type: Consumable.type,
    };
  }
}
