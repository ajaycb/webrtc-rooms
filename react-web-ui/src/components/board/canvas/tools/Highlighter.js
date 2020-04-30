import { ToolWithStroke } from "./base";
import { createShape } from "../shapes";

class Pencil extends ToolWithStroke {
  begin(x, y, lc) {
    this.color = lc.getColor("primary");
    this.currentShape = this.makeShape();
    console.warn("line shape", this.currentShape);
    this.currentShape.addPoint(this.makePoint(x, y, lc));
    this.lastEventTime = Date.now();
    setTimeout(() => this.removePoints(lc), this.timeout || 1000);
  }

  continue(x, y, lc) {
    const timeDiff = Date.now() - this.lastEventTime;

    if (timeDiff > this.eventTimeThreshold) {
      this.lastEventTime += timeDiff;
      this.currentShape.addPoint(this.makePoint(x, y, lc));
      lc.drawShapeInProgress(this.currentShape);
    }
  }

  end(x, y, lc) {
    //lc.saveShape(this.currentShape);
    //this.currentShape = undefined;
  }

  makePoint(x, y, lc) {
    return createShape("Point", {
      x,
      y,
      size: this.strokeWidth,
      color: this.color,
    });
  }

  removePoints(lc) {
    if (this.currentShape.removePointsFromFront(10)) {
      lc.drawShapeInProgress(this.currentShape);
      setTimeout(() => this.removePoints(lc), 10);
    }
  }
  makeShape() {
    return createShape("LinePath");
  }
}

Pencil.prototype.name = "Highlighter";
Pencil.prototype.iconName = "highlighter";
Pencil.prototype.eventTimeThreshold = 10;

export default Pencil;
