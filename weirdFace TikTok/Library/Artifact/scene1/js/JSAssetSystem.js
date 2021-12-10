const amg = require('amg.cjs.development');

const Amaz = effect.Amaz;
class JSAssetSystem {
  constructor() {
    this.name = 'JSAssetSystem';
  }

  onInit() {
    amg.Engine.init(this.scene);
  }

  onStart() {
    amg.Engine.engine.start();
  }
  onUpdate(dt) {
    amg.Engine.engine.update(dt);
  }
  onLateUpdate(dt) {
    amg.Engine.engine.lateUpdate(dt);
  }
  onComponentAdded(comp) {}

  onEvent(event) {
    amg.Engine.engine.event(event);
  }
  onDestroy(){
    amg.Engine.engine.destroy();
  }
}

exports.JSAssetSystem = JSAssetSystem;
