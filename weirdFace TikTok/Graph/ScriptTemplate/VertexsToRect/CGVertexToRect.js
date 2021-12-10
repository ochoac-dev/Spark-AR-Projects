const {BaseNode} = require('./BaseNode');
const Amaz = effect.Amaz;

class CGVertexToRect extends BaseNode {
  constructor() {
    super();
  }

  getOutput() {
    if (!this.inputs[0]) {
      return;
    }
    let topLeft = this.inputs[0]();
    if (!this.inputs[1]) {
      return;
    }
    let bottomLeft = this.inputs[1]();
    if (!this.inputs[2]) {
      return;
    }
    let topRight = this.inputs[2]();
    if (!this.inputs[3]) {
      return;
    }
    let bottomRight = this.inputs[3]();
    return new Amaz.Rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
  }
}

exports.CGVertexToRect = CGVertexToRect;
