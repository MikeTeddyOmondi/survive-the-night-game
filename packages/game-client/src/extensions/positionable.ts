import Vector2 from "@shared/util/vector2";
import { ExtensionTypes } from "../../../game-shared/src/util/extension-types";
import { ClientExtensionSerialized } from "@/extensions/types";
import { BaseClientExtension } from "./base-extension";

export class ClientPositionable extends BaseClientExtension {
  public static readonly type = ExtensionTypes.POSITIONABLE;

  private position: Vector2 = new Vector2(0, 0);
  private size: Vector2 = new Vector2(0, 0);

  public getSize(): Vector2 {
    return this.size.clone();
  }

  public setSize(size: Vector2): this {
    this.size = size;
    return this;
  }

  public getCenterPosition(): Vector2 {
    return this.size.div(2).add(this.position);
  }

  public getPosition(): Vector2 {
    return this.position.clone();
  }

  public setPosition(position: Vector2): void {
    this.position = position;
  }

  public deserialize(data: ClientExtensionSerialized): this {
    this.position = new Vector2(data.position.x, data.position.y);
    this.size = new Vector2(data.size.x, data.size.y);
    return this;
  }
}
