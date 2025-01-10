import { EntityManager } from "../../managers/entity-manager";
import { ServerOnly } from "../traits";
import { Vector2 } from "../physics";
import { Collidable, Positionable } from "../extensions";
import { Entity } from "../entity";
import { Entities } from "@survive-the-night/game-shared";
import { RawEntity } from "@survive-the-night/game-shared";

export class Boundary extends Entity implements ServerOnly {
  constructor(entityManager: EntityManager) {
    super(entityManager, Entities.BOUNDARY);

    this.extensions = [new Positionable(this).setSize(16), new Collidable(this).setSize(16)];
  }

  isServerOnly(): boolean {
    return true;
  }

  setPosition(position: Vector2): void {
    this.getExt(Positionable).setPosition(position);
  }

  setSize(size: Vector2): void {
    const sizeValue = Math.max(size.x, size.y);
    this.getExt(Positionable).setSize(sizeValue);
    this.getExt(Collidable).setSize(sizeValue);
  }

  serialize(): RawEntity {
    return {
      ...super.serialize(),
      position: this.getExt(Positionable).getPosition(),
    };
  }
}
