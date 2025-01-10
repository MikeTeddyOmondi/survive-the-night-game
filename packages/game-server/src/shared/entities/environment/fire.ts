import { Entities } from "@survive-the-night/game-shared";
import { EntityManager } from "../../../managers/entity-manager";
import { Entity } from "../../entity";
import { Expirable, Ignitable, Illuminated, Positionable, Triggerable } from "../../extensions";

export class Fire extends Entity {
  public static readonly Size = 16;

  constructor(entityManager: EntityManager) {
    super(entityManager, Entities.FIRE);

    this.extensions = [
      new Positionable(this).setSize(16),
      new Triggerable(this, 16, 16, [Entities.ZOMBIE, Entities.PLAYER]).setOnEntityEntered(
        this.catchFire.bind(this)
      ),
      new Expirable(this, 8),
      new Illuminated(this, 150),
    ];
  }

  catchFire(entity: Entity) {
    if (!entity.hasExt(Ignitable)) {
      entity.addExtension(new Ignitable(entity));
    }
  }
}
