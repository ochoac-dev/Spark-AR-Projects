'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @class
 * @category Core
 * @name EventHandler
 * @classdesc Base class that implements functionality for event handling
 * Inherit EventHandler to use its functionalities.
 * @sdk 9.8.0
 */
class EventHandler {
  constructor() {
    this._callbacks = {};
    this._callbackActive = {};
  }

  _addCallback(name, callback, scope, once = false) {
    if (!name || typeof name !== 'string' || !callback) return;
    if (!this._callbacks[name]) this._callbacks[name] = [];
    if (this._callbackActive[name] && this._callbackActive[name] === this._callbacks[name]) this._callbackActive[name] = this._callbackActive[name].slice();

    this._callbacks[name].push({
      callback: callback,
      scope: scope || this,
      once: once
    });
  }
  /**
   * @function
   * @name EventHandler#on
   * @description Attach an event handler to an event with the specified name.
   * @param {string} name
   * @param {any} callback
   * @param {any} scope
   * @returns {EventHandler} This instance for chaining.
   * @sdk 9.8.0
   */


  on(name, callback, scope) {
    this._addCallback(name, callback, scope, false);

    return this;
  }
  /**
   * @function
   * @name EventHandler#off
   * @description Detach an event with a specific name, if there is no name provided, all the events are detached.
   * @param {string} name
   * @param {any} callback
   * @param {any} scope
   * @returns {EventHandler} This instance for chaining.
   * @sdk 9.8.0
   */


  off(name, callback, scope) {
    if (name) {
      if (this._callbackActive[name] && this._callbackActive[name] === this._callbacks[name]) this._callbackActive[name] = this._callbackActive[name].slice();
    } else {
      for (const key in this._callbackActive) {
        if (!this._callbacks[key]) continue;
        if (this._callbacks[key] !== this._callbackActive[key]) continue;
        this._callbackActive[key] = this._callbackActive[key].slice();
      }
    }

    if (!name) {
      this._callbacks = {};
    } else if (!callback) {
      if (this._callbacks[name]) this._callbacks[name] = [];
    } else {
      const events = this._callbacks[name];
      if (!events) return this;
      let count = events.length;

      for (let i = 0; i < count; i++) {
        if (events[i].callback !== callback) continue;
        if (scope && events[i].scope !== scope) continue;
        events[i--] = events[--count];
      }

      events.length = count;
    }

    return this;
  }
  /**
   * @function
   * @name EventHandler#fire
   * @description Fire an event with a specified name,  the argument is passed to the event listener
   * @param {string} name
   * @param {any} arg1
   * @param {any} arg2
   * @param {any} arg3
   * @param {any} arg4
   * @param {any} arg5
   * @param {any} arg6
   * @param {any} arg7
   * @param {any} arg8
   * @returns {EventHandler} This instance for chaining.
   * @sdk 9.8.0
   */


  fire(name, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    if (!name || !this._callbacks[name]) return this;
    let callbacks;

    if (!this._callbackActive[name]) {
      this._callbackActive[name] = this._callbacks[name];
    } else {
      if (this._callbackActive[name] === this._callbacks[name]) this._callbackActive[name] = this._callbackActive[name].slice();
      callbacks = this._callbacks[name].slice();
    }

    for (let i = 0; (callbacks || this._callbackActive[name]) && i < (callbacks || this._callbackActive[name]).length; i++) {
      const evt = (callbacks || this._callbackActive[name])[i];
      evt.callback.call(evt.scope, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);

      if (evt.once) {
        const ind = this._callbacks[name].indexOf(evt);

        if (ind !== -1) {
          if (this._callbackActive[name] === this._callbacks[name]) this._callbackActive[name] = this._callbackActive[name].slice();

          this._callbacks[name].splice(ind, 1);
        }
      }
    }

    if (!callbacks) this._callbackActive[name] = undefined;
    return this;
  }
  /**
   * @function
   * @name EventHandler#once
   * @description Attach an event handler to an event. This handler will be removed after being fired once.
   * @param {string} name
   * @param {any} callback
   * @param {any} scope
   * @returns {EventHandler} This instance for chaining.
   * @sdk 9.8.0
   */


  once(name, callback, scope) {
    this._addCallback(name, callback, scope, true);

    return this;
  }
  /**
   * @function
   * @name EventHandler#hasEvent
   * @description Test if there are any handlers bound to an event name.
   * @param {string} name
   * @returns {boolean} True if the object has handlers bound to the specified event name.
   * @sdk 9.8.0
   */


  hasEvent(name) {
    return this._callbacks[name] && this._callbacks[name].length !== 0 || false;
  }

}

const Amaz = effect.Amaz;const platform = effect;

/**
 * @class
 * @category Core
 * @name Component
 * @augments EventHandler
 * @classdesc Abstract Component class for adding capabilities to an {@link Entity}.
 * @description Constructor to create an Component instance.
 * To add an Component to a {@link Entity},
 * use {@link Entity#addComponent}:
 * @hideconstructor
 * @sdk 9.8.0
 */

class Component extends EventHandler {
  constructor(entity, nativeClass) {
    super();
    this.entity = entity;
    this.nativeClass = nativeClass;

    if (entity && nativeClass) {
      this.native = entity.native.addComponent(nativeClass);
    }
  }

  initialize(options, props) {
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];

      if (options && options.hasOwnProperty(prop)) {
        this[prop] = options[prop];
      }
    }
  }

  initWithNative(entity, native, nativeClass) {
    this.entity = entity;
    this.native = native;
    this.nativeClass = nativeClass;
  }
  /**
   * @function
   * @name Component#destroy
   * @description Destroy and clean up the component.
   * @sdk 9.8.0
   */


  destroy() {
    if (this.entity && this.nativeClass) {
      this.entity.native.removeComponent(this.nativeClass);
      this.entity = undefined;
    }
  }

  addListener(eventType, callback, callbackThis) {
    if (this.native) {
      Amaz.AmazingManager.addListener(this.native, eventType, callback, callbackThis);
    } else {
      throw new Error('Invalid native component in Component:addListener');
    }
  }

  removeListener(eventType, callback) {
    if (this.native) {
      Amaz.AmazingManager.removeListener(this.native, eventType, callback);
    } else {
      throw new Error('Invalid native component in Component:removeListener');
    }
  }
  /**
   * @name Component#enabled
   * @type {boolean}
   * @description The flag to enable/disable component.
   * @sdk 9.8.0
   */


  get enabled() {
    return this.native.enabled;
  }

  set enabled(value) {
    this.native.enabled = value;
  }

}

/**
 * @enum {enum}
 * @memberof amg
 * @description Define the device's orientation mode.
 * @property {number} Portrait Vertical screen.
 * @property {number} Landscape Horizontal screen.
 * @sdk 9.8.0
 */



(function (DeviceOrientationMode) {
  DeviceOrientationMode[DeviceOrientationMode["Portrait"] = 0] = "Portrait";
  DeviceOrientationMode[DeviceOrientationMode["Landscape"] = 1] = "Landscape";
})(exports.DeviceOrientationMode || (exports.DeviceOrientationMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define coordindate system for gyroscope data.
 * @property {number} Device Device bound coordindate system.
 * @property {number} Screen  Screen bound coordindate system.
 * @sdk 9.8.0
 */

/**
 * @enum {enum}
 * @memberof amg
 * @description Define the camera type.
 * @property {number} Perspective A camera with the perspective projection.
 * @property {number} Orthographic A camera with the orthographic projection.
 * @sdk 9.8.0
 */




(function (CameraType) {
  CameraType[CameraType["Perspective"] = Amaz.CameraType.PERSPECTIVE] = "Perspective";
  CameraType[CameraType["Orthographic"] = Amaz.CameraType.ORTHO] = "Orthographic";
})(exports.CameraType || (exports.CameraType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define vertex's attribute's types.
 * @property {number} Position Position attribute.
 * @property {number} Normal Normal attribute.
 * @property {number} Tangent Tangent attribute.
 * @property {number} Color Color attribute.
 * @property {number} Texcoord0 Texcoord0 attribute.
 * @sdk 9.8.0
 */




(function (VertexAttribType) {
  VertexAttribType[VertexAttribType["Position"] = Amaz.VertexAttribType.POSITION] = "Position";
  VertexAttribType[VertexAttribType["Normal"] = Amaz.VertexAttribType.NORMAL] = "Normal";
  VertexAttribType[VertexAttribType["Tangent"] = Amaz.VertexAttribType.TANGENT] = "Tangent";
  VertexAttribType[VertexAttribType["Color"] = Amaz.VertexAttribType.COLOR] = "Color";
  VertexAttribType[VertexAttribType["Texcoord0"] = Amaz.VertexAttribType.TEXCOORD0] = "Texcoord0";
})(exports.VertexAttribType || (exports.VertexAttribType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the light's type.
 * @property {number} Directional Directional light.
 * @property {number} Point Point light.
 * @property {number} Spot Spot light.
 * @sdk 9.8.0
 */




(function (LightType) {
  LightType[LightType["Directional"] = 0] = "Directional";
  LightType[LightType["Point"] = 1] = "Point";
  LightType[LightType["Spot"] = 2] = "Spot";
})(exports.LightType || (exports.LightType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the 3d collider's types.
 * @property {number} Box 3d box collider.
 * @property {number} Sphere 3d sphere collider.
 * @property {number} Capsule 3d capsule collider.
 * @sdk 9.8.0
 */




(function (Collider3DType) {
  Collider3DType[Collider3DType["Box"] = 0] = "Box";
  Collider3DType[Collider3DType["Sphere"] = 1] = "Sphere";
  Collider3DType[Collider3DType["Capsule"] = 2] = "Capsule";
})(exports.Collider3DType || (exports.Collider3DType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the 3d physics body's types.
 * @property {number} Static Static body.
 * @property {number} Kinematic Kinematic body, velocity based movement.
 * @property {number} Dynamic Dynamic body, force based movement.
 * @sdk 9.8.0
 */




(function (Physics3DType) {
  Physics3DType[Physics3DType["Static"] = Amaz.RigidBodyType.STATIC] = "Static";
  Physics3DType[Physics3DType["Kinematic"] = Amaz.RigidBodyType.KINEMATIC] = "Kinematic";
  Physics3DType[Physics3DType["Dynamic"] = Amaz.RigidBodyType.DYNAMIC] = "Dynamic";
})(exports.Physics3DType || (exports.Physics3DType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define 3d sprite's render mode.
 * @property {number} Fit Fit image's width/height to sprite size, keep aspect ratio.
 * @property {number} Fill Fill image's width/height to sprite size, keep aspect ratio.
 * @property {number} FitWidth Fit width only, keep aspect ratio..
 * @property {number} FitHeight Fit height only, keep aspect ratio..
 * @property {number} Stretch Stretch image to fit into sprite size.
 * @property {number} FillCut Fill image to sprite size, allow cut off.
 * @property {number} ImageSize Use image size.
 * @sdk 9.8.0
 */




(function (SpriteRenderMode) {
  SpriteRenderMode[SpriteRenderMode["Fit"] = Amaz.StretchMode.fit] = "Fit";
  SpriteRenderMode[SpriteRenderMode["Fill"] = Amaz.StretchMode.fill] = "Fill";
  SpriteRenderMode[SpriteRenderMode["FitWidth"] = Amaz.StretchMode.fit_width] = "FitWidth";
  SpriteRenderMode[SpriteRenderMode["FitHeight"] = Amaz.StretchMode.fit_height] = "FitHeight";
  SpriteRenderMode[SpriteRenderMode["Stretch"] = Amaz.StretchMode.stretch] = "Stretch";
  SpriteRenderMode[SpriteRenderMode["FillCut"] = Amaz.StretchMode.fill_cut] = "FillCut";
  SpriteRenderMode[SpriteRenderMode["ImageSize"] = Amaz.StretchMode.texture_size] = "ImageSize";
})(exports.SpriteRenderMode || (exports.SpriteRenderMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the 2d sprite's render mode.
 * @property {number} Normal Use original image resource.
 * @property {number} Tiled The image will be repeated to fit the size of the sprite.
 * @property {number} Sliced The image is cut up into 9-slices.
 * @property {number} Filled Scale image to fill the size of the the sprite.
 * @property {number} Ellipse Render the sprite with ellipse mask.
 * @property {number} Free Freely adjust each corner of the sprite.
 * @property {number} Grid Arrange the image into grid.
 * @property {number} Corner Rounded corners.
 * @property {number} Outline Render image with outline.
 * @sdk 9.8.0
 */




(function (ImageRenderMode) {
  ImageRenderMode[ImageRenderMode["Normal"] = Amaz.IFSprite2dType.Normal] = "Normal";
  ImageRenderMode[ImageRenderMode["Tiled"] = Amaz.IFSprite2dType.Tiled] = "Tiled";
  ImageRenderMode[ImageRenderMode["Sliced"] = Amaz.IFSprite2dType.Sliced] = "Sliced";
  ImageRenderMode[ImageRenderMode["Filled"] = Amaz.IFSprite2dType.Filled] = "Filled";
  ImageRenderMode[ImageRenderMode["Ellipse"] = Amaz.IFSprite2dType.Ellipse] = "Ellipse";
  ImageRenderMode[ImageRenderMode["Free"] = Amaz.IFSprite2dType.Free] = "Free";
  ImageRenderMode[ImageRenderMode["Corner"] = Amaz.IFSprite2dType.Corner] = "Corner";
})(exports.ImageRenderMode || (exports.ImageRenderMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the 2d sprite's fill type.
 * @property {number} Horizontal Fill image in horizontal direction.
 * @property {number} Vertical Fill image in vertical direction.
 * @property {number} Radial Fill image in radial direction.
 * @depends {@link amg.ImageRenderMode.Filled}
 * @sdk 9.8.0
 */




(function (ImageFillType) {
  ImageFillType[ImageFillType["Horizontal"] = Amaz.IFFilledType.Horizontal] = "Horizontal";
  ImageFillType[ImageFillType["Vertical"] = Amaz.IFFilledType.Vertical] = "Vertical";
  ImageFillType[ImageFillType["Radial"] = Amaz.IFFilledType.Radial] = "Radial";
})(exports.ImageFillType || (exports.ImageFillType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define 2d layer's blending mode.
 * More info: https://en.wikipedia.org/wiki/Blend_modes
 * @property {number} Normal Default value, no color mixing.
 * @property {number} Add Each pixel's RGB component intensity is added to the intensity of the pixel values from the composition.
 * @property {number} Average Average blending.
 * @property {number} Burn This blend mode has the effect of making dark pixels darker while lighter pixels must be blended with other light colored pixels in order to remain bright.
 * @property {number} Dodge This can be thought of as the opposite of {@link amg.CanvasBlendMode.Burn}. Lighter pixels retain their brightness while darker pixels must be blended with other dark pixels in order to remain dark..
 * @property {number} Darken The darkest pixel of either the blend layer or the composition is used.
 * @property {number} Difference The layer pixel's intensity is subtracted from the composition pixel's intensity resulting in darker colors.
 * @property {number} Exclusion Exclusion is very similar to {@link amg.CanvasBlendMode.Difference}. Blending with white inverts the base color values, while blending with black produces no change. However, Blending with 50% gray produces 50% gray.
 * @property {number} Glow Glow effectively brightens the composition by the amount of brightness in the blend layer.  Black pixels in the blend layer are rendered as if they were transparent.
 * @property {number} HardLight Hard Light is also a combination of {@link amg.CanvasBlendMode.Multiply} and {@link amg.CanvasBlendMode.Screen}. {@link amg.CanvasBlendMode.HardLight} affects the blend layer's relationship to the base layer in the same way {@link amg.CanvasBlendMode.Overlay} affects the base layer's relationship to the blend layer. The inverse relationship between {@link amg.CanvasBlendMode.Overlay} and {@link amg.CanvasBlendMode.HardLight} makes them "commuted blend modes".
 * @property {number} HardMix It applies the blend by adding the value of each RGB channel into the blend layer to the corresponding RGB channel in the base layer.
 * @property {number} Lighten The lightest pixel of either the blend layer or the composition is used.
 * @property {number} LinearBurn Linear Burn decreases the brightness of the base color based on the value of the blend color.
 * @property {number} LinearDodge Linear Dodge produces similar but stronger results than {@link amg.CanvasBlendMode.Screen} or {@link amg.CanvasBlendMode.Dodge}.
 * @property {number} LinearLight Linear Light uses a combination of the {@link amg.CanvasBlendMode.LinearDodge} on lighter pixels and {@link amg.CanvasBlendMode.LinearBurn} on darker pixels.
 * @property {number} Multiply Each pixel's RGB component intensity is multiplied with the pixel value from the composition.
 * @property {number} Negation At first glance this seems similar to {@link amg.CanvasBlendMode.Difference}, however it actually produces the opposite effect.  Instead of making colors darker, it will make them brighter.
 * @property {number} Overlay This is a combination of {@link amg.CanvasBlendMode.Screen} and {@link amg.CanvasBlendMode.Multiply} modes.
 * @property {number} Phoenix This subtracts the lighter pixel from the darker pixel, and adds 255, giving a bright result.
 * @property {number} PinLight Pin Light is an extreme Blending Mode that performs a {@link amg.CanvasBlendMode.Darken} and {@link amg.CanvasBlendMode.Lighten} simultaneously. It can result in patches or blotches, and it completely removes all mid-tones.
 * @property {number} Reflect This blend mode can be used for adding shiny objects or areas of light. Black pixels in the blend layer are ignored as if they were transparent.
 * @property {number} Screen This can be thought of as the opposite of the {@link amg.CanvasBlendMode.Multiply} blend mode. It is used to make pixels brighter, with black being effectively transparent.
 * @property {number} Softlight Soft light is most closely related to {@link amg.CanvasBlendMode.Overlay} and is only similar to {@link amg.CanvasBlendMode.HardLight} by name. Applying pure black or white does not result in pure black or white.
 * @property {number} Substract The Subtract Blending Mode subtracts pixel values from the base layer. This Blending Mode drastically darkens pixels by subtracting brightness.
 * @property {number} VividLight You can think of Vivid Light as an extreme version of {@link amg.CanvasBlendMode.Overlay} and {@link amg.CanvasBlendMode.SoftLight}. Anything darker than 50% gray is darkened, and anything lighter than 50% gray is lightened.
 * @property {number} SnowColor Snow added blending.
 * @property {number} SnowHue Snow saturation blending.
 * @sdk 9.8.0
 */




(function (CanvasBlendMode) {
  CanvasBlendMode[CanvasBlendMode["Normal"] = Amaz.IFBlendMode.Normal] = "Normal";
  CanvasBlendMode[CanvasBlendMode["Add"] = Amaz.IFBlendMode.Add] = "Add";
  CanvasBlendMode[CanvasBlendMode["Average"] = Amaz.IFBlendMode.Average] = "Average";
  CanvasBlendMode[CanvasBlendMode["Burn"] = Amaz.IFBlendMode.Burn] = "Burn";
  CanvasBlendMode[CanvasBlendMode["Dodge"] = Amaz.IFBlendMode.Dodge] = "Dodge";
  CanvasBlendMode[CanvasBlendMode["Darken"] = Amaz.IFBlendMode.Darken] = "Darken";
  CanvasBlendMode[CanvasBlendMode["Difference"] = Amaz.IFBlendMode.Difference] = "Difference";
  CanvasBlendMode[CanvasBlendMode["Exclusion"] = Amaz.IFBlendMode.Exclusion] = "Exclusion";
  CanvasBlendMode[CanvasBlendMode["Glow"] = Amaz.IFBlendMode.Glow] = "Glow";
  CanvasBlendMode[CanvasBlendMode["HardLight"] = Amaz.IFBlendMode.Hardlight] = "HardLight";
  CanvasBlendMode[CanvasBlendMode["HardMix"] = Amaz.IFBlendMode.Hardmix] = "HardMix";
  CanvasBlendMode[CanvasBlendMode["Lighten"] = Amaz.IFBlendMode.Lighten] = "Lighten";
  CanvasBlendMode[CanvasBlendMode["LinearBurn"] = Amaz.IFBlendMode.Linearburn] = "LinearBurn";
  CanvasBlendMode[CanvasBlendMode["LinearDodge"] = Amaz.IFBlendMode.Lineardodge] = "LinearDodge";
  CanvasBlendMode[CanvasBlendMode["LinearLight"] = Amaz.IFBlendMode.Linearlight] = "LinearLight";
  CanvasBlendMode[CanvasBlendMode["Multiply"] = Amaz.IFBlendMode.Multiply] = "Multiply";
  CanvasBlendMode[CanvasBlendMode["Negation"] = Amaz.IFBlendMode.Negation] = "Negation";
  CanvasBlendMode[CanvasBlendMode["Overlay"] = Amaz.IFBlendMode.Overlay] = "Overlay";
  CanvasBlendMode[CanvasBlendMode["Phoenix"] = Amaz.IFBlendMode.Phoenix] = "Phoenix";
  CanvasBlendMode[CanvasBlendMode["PinLight"] = Amaz.IFBlendMode.Pinlight] = "PinLight";
  CanvasBlendMode[CanvasBlendMode["Reflect"] = Amaz.IFBlendMode.Reflect] = "Reflect";
  CanvasBlendMode[CanvasBlendMode["Screen"] = Amaz.IFBlendMode.Screen] = "Screen";
  CanvasBlendMode[CanvasBlendMode["Softlight"] = Amaz.IFBlendMode.Softlight] = "Softlight";
  CanvasBlendMode[CanvasBlendMode["Substract"] = Amaz.IFBlendMode.Substract] = "Substract";
  CanvasBlendMode[CanvasBlendMode["VividLight"] = Amaz.IFBlendMode.Vividlight] = "VividLight";
  CanvasBlendMode[CanvasBlendMode["SnowColor"] = Amaz.IFBlendMode.Snowcolor] = "SnowColor";
  CanvasBlendMode[CanvasBlendMode["SnowHue"] = Amaz.IFBlendMode.Snowhue] = "SnowHue";
  CanvasBlendMode[CanvasBlendMode["EndFlag"] = Amaz.IFBlendMode.EndFlag] = "EndFlag";
})(exports.CanvasBlendMode || (exports.CanvasBlendMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define 2d layer's mask types.
 * @property {number} None No mask.
 * @property {number} Rect Rectangle shape mask.
 * @property {number} Ellipse Ellipse shape mask.
 * @property {number} Sprites Sprite mask.
 * @sdk 9.8.0
 */




(function (CanvasMaskType) {
  CanvasMaskType[CanvasMaskType["None"] = Amaz.IFMaskType.None] = "None";
  CanvasMaskType[CanvasMaskType["Rect"] = Amaz.IFMaskType.Rect] = "Rect";
  CanvasMaskType[CanvasMaskType["Ellipse"] = Amaz.IFMaskType.Ellipse] = "Ellipse";
  CanvasMaskType[CanvasMaskType["Sprites"] = Amaz.IFMaskType.MaskSprites] = "Sprites";
})(exports.CanvasMaskType || (exports.CanvasMaskType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define 2d layer's render order.
 * @property {number} Overlay Default, use predefined UI layer order.
 * @property {number} Custom Use order in scene, user can custom.
 * @sdk 9.8.0
 */




(function (CanvasRenderOrder) {
  CanvasRenderOrder[CanvasRenderOrder["Overlay"] = Amaz.IFLayer2dRenderOrderMode.ScreenOverlay] = "Overlay";
  CanvasRenderOrder[CanvasRenderOrder["Custom"] = Amaz.IFLayer2dRenderOrderMode.SceneCustom] = "Custom";
})(exports.CanvasRenderOrder || (exports.CanvasRenderOrder = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define sequential image based animation's play mode.
 * @property {number} Once Play once.
 * @property {number} Loop Play then loop.
 * @property {number} PingPong Play then loop, forward then backward.
 * @property {number} Random Play random frame.
 * @sdk 9.8.0
 */




(function (SeqAnimationPlayMode) {
  SeqAnimationPlayMode[SeqAnimationPlayMode["Once"] = Amaz.PlayMode.once] = "Once";
  SeqAnimationPlayMode[SeqAnimationPlayMode["Loop"] = Amaz.PlayMode.loop] = "Loop";
  SeqAnimationPlayMode[SeqAnimationPlayMode["PingPong"] = Amaz.PlayMode.pingpong] = "PingPong";
  SeqAnimationPlayMode[SeqAnimationPlayMode["Random"] = Amaz.PlayMode.random] = "Random";
})(exports.SeqAnimationPlayMode || (exports.SeqAnimationPlayMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the canvas scaler's types.
 * @property {number} Origin Use 2d layer's.
 * @property {number} FitWidth Fit width, scale height but keep aspect ratio.
 * @property {number} FitHeight Fit height, scale width but keep aspect ratio.
 * @property {number} Fit Auto fit width or height depending on aspect ratio.
 * @property {number} Fill Scale both width and height to target 2d layer's size.
 * @sdk 9.8.0
 */




(function (CanvasScalerType) {
  CanvasScalerType[CanvasScalerType["Origin"] = Amaz.IFResolutionType.Origin] = "Origin";
  CanvasScalerType[CanvasScalerType["FitWidth"] = Amaz.IFResolutionType.FitWidth] = "FitWidth";
  CanvasScalerType[CanvasScalerType["FitHeight"] = Amaz.IFResolutionType.FitHeight] = "FitHeight";
  CanvasScalerType[CanvasScalerType["Fit"] = Amaz.IFResolutionType.Fit] = "Fit";
  CanvasScalerType[CanvasScalerType["Fill"] = Amaz.IFResolutionType.Fill] = "Fill";
})(exports.CanvasScalerType || (exports.CanvasScalerType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the ui collider's tyoe.
 * @property {number} Box Box collider.
 * @sdk 9.8.0
 */




(function (UIColliderType) {
  UIColliderType[UIColliderType["Box"] = 0] = "Box";
})(exports.UIColliderType || (exports.UIColliderType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the slider's mode.
 * @property {number} Follow Absolute value 0-1.
 * @property {number} Offset Offset value from 1st touch.
 * @property {number} DragThumb When dragging the slider's thumb.
 * @sdk 9.8.0
 */




(function (SliderMode) {
  SliderMode[SliderMode["Follow"] = Amaz.IFUISliderMode.FOLLOW] = "Follow";
  SliderMode[SliderMode["Offset"] = Amaz.IFUISliderMode.OFFSET] = "Offset";
  SliderMode[SliderMode["DragThumb"] = Amaz.IFUISliderMode.DRAG_THUMB] = "DragThumb";
})(exports.SliderMode || (exports.SliderMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the slider's moving direction.
 * @property {number} LeftRight Left to right.
 * @property {number} RightLeft Right to left.
 * @property {number} BottomTop Bottom to top.
 * @property {number} TopBottom Top to bottom.
 * @sdk 9.8.0
 */




(function (UIMoveDirection) {
  UIMoveDirection[UIMoveDirection["LeftRight"] = Amaz.IFUIMoveDirection.LEFT_TO_RIGHT] = "LeftRight";
  UIMoveDirection[UIMoveDirection["RightLeft"] = Amaz.IFUIMoveDirection.RIGHT_TO_LEFT] = "RightLeft";
  UIMoveDirection[UIMoveDirection["BottomTop"] = Amaz.IFUIMoveDirection.BOTTOM_TO_TOP] = "BottomTop";
  UIMoveDirection[UIMoveDirection["TopBottom"] = Amaz.IFUIMoveDirection.TOP_TO_BOTTOM] = "TopBottom";
})(exports.UIMoveDirection || (exports.UIMoveDirection = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the label's font type.
 * @property {number} System System type.
 * @property {number} TrueType True type.
 * @property {number} Bitmap Bitmap type.
 * @sdk 9.8.0
 */




(function (LabelFontType) {
  LabelFontType[LabelFontType["System"] = Amaz.IFUILabelFontType.System] = "System";
  LabelFontType[LabelFontType["TrueType"] = Amaz.IFUILabelFontType.TrueType] = "TrueType";
  LabelFontType[LabelFontType["Bitmap"] = Amaz.IFUILabelFontType.Bitmap] = "Bitmap";
})(exports.LabelFontType || (exports.LabelFontType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the label's alignment.
 * @property {number} Left Left alignment.
 * @property {number} Right Right alignment.
 * @property {number} Center Center alignment.
 * @sdk 9.8.0
 */




(function (LabelAlignment) {
  LabelAlignment[LabelAlignment["Left"] = Amaz.IFUILabelAlignment.Left] = "Left";
  LabelAlignment[LabelAlignment["Right"] = Amaz.IFUILabelAlignment.Right] = "Right";
  LabelAlignment[LabelAlignment["Center"] = Amaz.IFUILabelAlignment.Center] = "Center";
})(exports.LabelAlignment || (exports.LabelAlignment = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define the label's fit type.
 * @property {number} AutoSize Auto adjust size to fit to lable's bounding rect.
 * @property {number} FitWidth Adjust bounding rect 's width to fit its size.
 * @property {number} FitSize Fit label bounding rect's size to its size.
 * @sdk 9.8.0
 */




(function (LabelFitType) {
  LabelFitType[LabelFitType["AutoSize"] = Amaz.IFUILabelFitType.AutoSize] = "AutoSize";
  LabelFitType[LabelFitType["FitWidth"] = Amaz.IFUILabelFitType.FitWidth] = "FitWidth";
  LabelFitType[LabelFitType["FitSize"] = Amaz.IFUILabelFitType.FitSize] = "FitSize";
})(exports.LabelFitType || (exports.LabelFitType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define layout's types.
 * @property {number} None No layout.
 * @property {number} Horizontal Layout 2d components in horizontal direction.
 * @property {number} Vertical Layout 2d components in vertical direction.
 * @property {number} Grid Layout 2d components in grid.
 * @sdk 9.8.0
 */




(function (LayoutType) {
  LayoutType[LayoutType["None"] = Amaz.IFUIGridType.NONE] = "None";
  LayoutType[LayoutType["Horizontal"] = Amaz.IFUIGridType.HORIZONTAL] = "Horizontal";
  LayoutType[LayoutType["Vertical"] = Amaz.IFUIGridType.VERTICAL] = "Vertical";
  LayoutType[LayoutType["Grid"] = Amaz.IFUIGridType.GRID] = "Grid";
})(exports.LayoutType || (exports.LayoutType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define layout's size mode.
 * @property {number} None No layout.
 * @property {number} Container Resize container.
 * @property {number} Children Resize children.
 * @sdk 9.8.0
 */




(function (LayoutSizeMode) {
  LayoutSizeMode[LayoutSizeMode["None"] = Amaz.IFUIGridResizeMode.NONE] = "None";
  LayoutSizeMode[LayoutSizeMode["Container"] = Amaz.IFUIGridResizeMode.CONTAINER] = "Container";
  LayoutSizeMode[LayoutSizeMode["Children"] = Amaz.IFUIGridResizeMode.CHILDREN] = "Children";
})(exports.LayoutSizeMode || (exports.LayoutSizeMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define layout's grid mode.
 * @property {number} Horizontal Horizontal first.
 * @property {number} Vertical Vertical first.
 * @sdk 9.8.0
 */




(function (LayoutGridMode) {
  LayoutGridMode[LayoutGridMode["Horizontal"] = Amaz.IFUIGridStartAxis.HORIZONTAL] = "Horizontal";
  LayoutGridMode[LayoutGridMode["Vertical"] = Amaz.IFUIGridStartAxis.VERTICAL] = "Vertical";
})(exports.LayoutGridMode || (exports.LayoutGridMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define layout's vertical direction.
 * @property {number} TopBottom Top to bottom.
 * @property {number} BottomTop Bottom to top.
 * @depends amg.LayoutType
 * @sdk 9.8.0
 */




(function (LayoutVerticalDirection) {
  LayoutVerticalDirection[LayoutVerticalDirection["TopBottom"] = Amaz.IFUIGridVerticalDirection.TOP_TO_BOTTOM] = "TopBottom";
  LayoutVerticalDirection[LayoutVerticalDirection["BottomTop"] = Amaz.IFUIGridVerticalDirection.BOTTOM_TO_TOP] = "BottomTop";
})(exports.LayoutVerticalDirection || (exports.LayoutVerticalDirection = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define layout's horizontal direction.
 * @property {number} LeftRight Left to right.
 * @property {number} RightLeft Right to left.
 * @depends amg.LayoutType
 * @sdk 9.8.0
 */




(function (LayoutHorizontalDirection) {
  LayoutHorizontalDirection[LayoutHorizontalDirection["LeftRight"] = Amaz.IFUIGridHorizontalDirection.LEFT_TO_RIGHT] = "LeftRight";
  LayoutHorizontalDirection[LayoutHorizontalDirection["RightLeft"] = Amaz.IFUIGridHorizontalDirection.RIGHT_TO_LEFT] = "RightLeft";
})(exports.LayoutHorizontalDirection || (exports.LayoutHorizontalDirection = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define layout's sort mode.
 * @property {number} None No sorting.
 * @property {number} Alphabetic Alphabetic sorting.
 * @sdk 9.8.0
 */




(function (LayoutSortMode) {
  LayoutSortMode[LayoutSortMode["None"] = Amaz.IFUIGridSortingType.NONE] = "None";
  LayoutSortMode[LayoutSortMode["Alphabetic"] = Amaz.IFUIGridSortingType.ALPHABETIC] = "Alphabetic";
})(exports.LayoutSortMode || (exports.LayoutSortMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Different segmentation type.
 * @property {string} Head To get the head segmentation mask.
 * @property {string} Body To get the body segmentation mask.
 * @property {string} Hair To get the hair segmentation mask.
 * @property {string} Sky To get the sky segmentation mask.
 * @property {string} Building To get the building segmentation mask.
 * @property {string} Cloth To get the cloth segmentation mask.
 * @property {string} Ground To get the ground segmentation mask.
 * @sdk 9.8.0
 */




(function (SegmentationType) {
  /**
   * @depends HeadSeg
   */
  SegmentationType["Head"] = "head";
  /**
   * @depends BodySeg
   */

  SegmentationType["Body"] = "body";
  /**
   * @depends Hair
   */

  SegmentationType["Hair"] = "hair";
  /**
   * @depends SkySeg
   */

  SegmentationType["Sky"] = "sky";
  /**
   * @depends BuildingSeg
   */

  SegmentationType["Building"] = "building";
  /**
   * @depends Cloth
   */

  SegmentationType["Cloth"] = "cloth";
  /**
   * @depends GroundSeg
   */

  SegmentationType["Ground"] = "ground";
})(exports.SegmentationType || (exports.SegmentationType = {}));
/**
 * @constant
 * @memberof amg
 * @name EntityLayerMax
 * @description Max layer: 64.
 * @type {number}
 */


const EntityLayerMax = 64;
/**
 * @constant
 * @memberof amg
 * @name EntityTagMax
 * @description Max tag 32.
 * @type {number}
 */

const EntityTagMax = 32;
/**
 * @enum {enum}
 * @memberof amg
 * @description Define play mode of animation.
 * @property {number} Once Play once then stop.
 * @property {number} Loop Play then loop.
 * @property {number} PingPong Play ping-pong loop.
 * @property {number} Clamp Play once then repeat last frame.
 * @property {number} Seek Seek to a frame then play it.
 * @sdk 9.8.0
 */



(function (AnimationPlayMode) {
  AnimationPlayMode[AnimationPlayMode["Once"] = 1] = "Once";
  AnimationPlayMode[AnimationPlayMode["Loop"] = 0] = "Loop";
  AnimationPlayMode[AnimationPlayMode["PingPong"] = -1] = "PingPong";
  AnimationPlayMode[AnimationPlayMode["Clamp"] = -2] = "Clamp";
  AnimationPlayMode[AnimationPlayMode["Seek"] = -3] = "Seek";
})(exports.AnimationPlayMode || (exports.AnimationPlayMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define render orientation types of particle system.
 * @property {number} Billboard Always face camera.
 * @property {number} Direction Use moving direction for orientation.
 * @property {number} Shape Face camera by rotating around Up.
 * @property {number} Fixed No rotation applied.
 * @sdk 9.8.0
 */




(function (ParticleSystemRenderOrientation) {
  ParticleSystemRenderOrientation[ParticleSystemRenderOrientation["Billboard"] = Amaz.ParticleQuatRendererOrientationType.BILLBOARD] = "Billboard";
  ParticleSystemRenderOrientation[ParticleSystemRenderOrientation["Direction"] = Amaz.ParticleQuatRendererOrientationType.DIRECTION] = "Direction";
  ParticleSystemRenderOrientation[ParticleSystemRenderOrientation["Shape"] = Amaz.ParticleQuatRendererOrientationType.SHAPE] = "Shape";
  ParticleSystemRenderOrientation[ParticleSystemRenderOrientation["Fixed"] = Amaz.ParticleQuatRendererOrientationType.FIXED] = "Fixed";
})(exports.ParticleSystemRenderOrientation || (exports.ParticleSystemRenderOrientation = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define sorting modes of particle system.
 * @property {number} ByDistance By distance from camera, closer in front.
 * @property {number} OldestInFront By age, older in front.
 * @property {number} YoungestInFront By age, younger in front.
 */




(function (ParticleSystemRenderSortingMode) {
  ParticleSystemRenderSortingMode[ParticleSystemRenderSortingMode["ByDistance"] = Amaz.ParticleRenderSortingMode.BY_DISTANCE] = "ByDistance";
  ParticleSystemRenderSortingMode[ParticleSystemRenderSortingMode["OldestInFront"] = Amaz.ParticleRenderSortingMode.OLDEST_IN_FRONT] = "OldestInFront";
  ParticleSystemRenderSortingMode[ParticleSystemRenderSortingMode["YoungestInFront"] = Amaz.ParticleRenderSortingMode.YOUNGEST_IN_FRONT] = "YoungestInFront";
})(exports.ParticleSystemRenderSortingMode || (exports.ParticleSystemRenderSortingMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define render types of particle system.
 * Use it for {@link amg.ParticleSystemRenderType.Mesh}.
 * @property {number} Quad Use quad mesh.
 * @property {number} Mesh Use custom mesh.
 */




(function (ParticleSystemRenderType) {
  ParticleSystemRenderType[ParticleSystemRenderType["Quad"] = 0] = "Quad";
  ParticleSystemRenderType[ParticleSystemRenderType["Mesh"] = 1] = "Mesh";
})(exports.ParticleSystemRenderType || (exports.ParticleSystemRenderType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define display modes of particle system.
 * Use it for {@link amg.ParticleSystemRenderType.Mesh}.
 * @property {number} ScaleByParticle Use particle's width/height/depth for scale.
 * @property {number} SizeByParticle  Use particle's width/height/depth and mesh's size (x,y,z) for scale.
 */




(function (ParticleSystemRenderDisplayMode) {
  ParticleSystemRenderDisplayMode[ParticleSystemRenderDisplayMode["ScaleByParticle"] = Amaz.ParticleMeshRendererType.SCALE_BY_PARTICLE] = "ScaleByParticle";
  ParticleSystemRenderDisplayMode[ParticleSystemRenderDisplayMode["SizeByParticle"] = Amaz.ParticleMeshRendererType.SIZE_BY_PARTICLE] = "SizeByParticle";
})(exports.ParticleSystemRenderDisplayMode || (exports.ParticleSystemRenderDisplayMode = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define particle system's affector.
 * @property {number} None No affector.
 * @property {number} Color Add color affector.
 * @sdk 9.8.0
 */




(function (ParticleSystemAffector) {
  ParticleSystemAffector[ParticleSystemAffector["None"] = 0] = "None";
  ParticleSystemAffector[ParticleSystemAffector["Color"] = 1] = "Color";
})(exports.ParticleSystemAffector || (exports.ParticleSystemAffector = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Define oepration of particle system's color affecter.
 * @property {number} Set Set color.
 * @property {number} Multiply  Multiply color.
 * @property {number} Random Randomize color.
 */




(function (ParticleSystemColorAffectorOperation) {
  ParticleSystemColorAffectorOperation[ParticleSystemColorAffectorOperation["Set"] = Amaz.ColorOperation.SET] = "Set";
  ParticleSystemColorAffectorOperation[ParticleSystemColorAffectorOperation["Multiply"] = Amaz.ColorOperation.MULTIPLY] = "Multiply";
  ParticleSystemColorAffectorOperation[ParticleSystemColorAffectorOperation["Random"] = Amaz.ColorOperation.RANDOM] = "Random";
})(exports.ParticleSystemColorAffectorOperation || (exports.ParticleSystemColorAffectorOperation = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Face part.
 * @property {number} Whole
 * @property {number} LeftEye
 * @property {number} RightEye
 * @property {number} Nose
 * @property {number} Mouth
 * @property {number} LeftEyeBrow
 * @property {number} RightEyeBrow
 * @sdk 9.8.0
 */




(function (FacePart) {
  FacePart[FacePart["Whole"] = 0] = "Whole";
  FacePart[FacePart["LeftEye"] = 1] = "LeftEye";
  FacePart[FacePart["RightEye"] = 2] = "RightEye";
  FacePart[FacePart["Nose"] = 3] = "Nose";
  FacePart[FacePart["Mouth"] = 4] = "Mouth";
  FacePart[FacePart["LeftEyeBrow"] = 5] = "LeftEyeBrow";
  FacePart[FacePart["RightEyeBrow"] = 6] = "RightEyeBrow";
})(exports.FacePart || (exports.FacePart = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Face expression. Remember it starts from -1.
 * @property {number} Unknown
 * @property {number} Angry
 * @property {number} Disgust
 * @property {number} Fear
 * @property {number} Happy
 * @property {number} Sad
 * @property {number} Surprise
 * @property {number} Neutral
 * @sdk 9.8.0
 */




(function (FaceExpression) {
  FaceExpression[FaceExpression["Unknown"] = 0] = "Unknown";
  FaceExpression[FaceExpression["Angry"] = 1] = "Angry";
  FaceExpression[FaceExpression["Disgust"] = 2] = "Disgust";
  FaceExpression[FaceExpression["Fear"] = 3] = "Fear";
  FaceExpression[FaceExpression["Happy"] = 4] = "Happy";
  FaceExpression[FaceExpression["Sad"] = 5] = "Sad";
  FaceExpression[FaceExpression["Surprise"] = 6] = "Surprise";
  FaceExpression[FaceExpression["Neutral"] = 7] = "Neutral";
})(exports.FaceExpression || (exports.FaceExpression = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description FaceEvent indicates head tracking status.
 * @property {string} Detected Head detected.
 * @property {string} Lost Lose track of a head.
 * @sdk 9.8.0
 */




(function (FaceEvent) {
  FaceEvent["Detected"] = "detected";
  FaceEvent["Lost"] = "lost";
})(exports.FaceEvent || (exports.FaceEvent = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Face Action.
 * @property {number} None
 * @property {number} EyeBlink
 * @property {number} EyeBlinkLeft
 * @property {number} EyeBlinkRight
 * @property {number} MouthAh
 * @property {number} MouthPout
 * @property {number} HeadYaw
 * @property {number} HeadPitch
 * @property {number} BrowJump
 * @property {number} SideNod
 * @sdk 9.8.0
 */




(function (FaceAction) {
  FaceAction[FaceAction["None"] = 0] = "None";
  FaceAction[FaceAction["EyeBlink"] = 1] = "EyeBlink";
  FaceAction[FaceAction["EyeBlinkLeft"] = 2] = "EyeBlinkLeft";
  FaceAction[FaceAction["EyeBlinkRight"] = 3] = "EyeBlinkRight";
  FaceAction[FaceAction["MouthAh"] = 4] = "MouthAh";
  FaceAction[FaceAction["MouthPout"] = 5] = "MouthPout";
  FaceAction[FaceAction["HeadYaw"] = 6] = "HeadYaw";
  FaceAction[FaceAction["HeadPitch"] = 7] = "HeadPitch";
  FaceAction[FaceAction["BrowJump"] = 8] = "BrowJump";
  FaceAction[FaceAction["SideNod"] = 9] = "SideNod";
})(exports.FaceAction || (exports.FaceAction = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Face Landmark type.
 * @property {number} Face106
 * @property {number} Face240
 * @property {number} Face280
 * @property {number} Face3d
 * @sdk 9.8.0
 */




(function (FaceLandmarkType) {
  FaceLandmarkType[FaceLandmarkType["Face106"] = 0] = "Face106";
  FaceLandmarkType[FaceLandmarkType["Face240"] = 1] = "Face240";
  FaceLandmarkType[FaceLandmarkType["Face280"] = 2] = "Face280";
  FaceLandmarkType[FaceLandmarkType["Face3d"] = 3] = "Face3d";
})(exports.FaceLandmarkType || (exports.FaceLandmarkType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description HandEvent indicates hand tracking status and gestures detected or changed.
 * @property {string} Detected Hand detected.
 * @property {string} Lost Lose track of a hand.
 * @property {string} StaticGesture Hand static gesture.
 * @property {string} DynamicGesture Hand dynamic gesture.
 * @sdk 9.8.0
 */




(function (HandEvent) {
  HandEvent["Lost"] = "lost";
  HandEvent["Detected"] = "detected";
  HandEvent["StaticGesture"] = "staticGesture";
  HandEvent["DynamicGesture"] = "dynamicGesture";
})(exports.HandEvent || (exports.HandEvent = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Hand static gesture.
 * @property {number} HeartA
 * @property {number} HeartB
 * @property {number} HeartC
 * @property {number} HeartD
 * @property {number} OK
 * @property {number} HandOpen
 * @property {number} ThumbUp
 * @property {number} ThumbDown
 * @property {number} Rock
 * @property {number} Namaste
 * @property {number} PalmUp
 * @property {number} Fist
 * @property {number} IndexFingerUp
 * @property {number} DoubleFingerUp
 * @property {number} Victory
 * @property {number} BigV
 * @property {number} PhoneCall
 * @property {number} Beg
 * @property {number} Thanks
 * @property {number} Unknown
 * @property {number} Cabbage
 * @property {number} Three
 * @property {number} Four
 * @property {number} Pistol
 * @property {number} Rock2
 * @property {number} Swear
 * @property {number} HoldFace
 * @property {number} Salute
 * @property {number} Spread
 * @property {number} Pray
 * @property {number} QiGong
 * @property {number} Slide
 * @property {number} PalmDown
 * @property {number} Pistol2
 * @property {number} NinjaMudra1
 * @property {number} NinjaMudra2
 * @property {number} NinjaMudra3
 * @property {number} NinjaMudra4
 * @property {number} NinjaMudra5
 * @property {number} NinjaMudra6
 * @property {number} NinjaMudra7
 * @property {number} NinjaMudra8
 * @property {number} NinjaMudra9
 * @property {number} NinjaMudra10
 * @property {number} NinjaMudra11
 * @property {number} SpiderHand
 * @property {number} AvengerHand
 * @property {number} MaxCount
 * @property {number} Undetect
 * @property {number} None
 * @sdk 9.8.0
 */




(function (HandStaticGesture) {
  HandStaticGesture[HandStaticGesture["HeartA"] = 0] = "HeartA";
  HandStaticGesture[HandStaticGesture["HeartB"] = 1] = "HeartB";
  HandStaticGesture[HandStaticGesture["HeartC"] = 2] = "HeartC";
  HandStaticGesture[HandStaticGesture["HeartD"] = 3] = "HeartD";
  HandStaticGesture[HandStaticGesture["OK"] = 4] = "OK";
  HandStaticGesture[HandStaticGesture["HandOpen"] = 5] = "HandOpen";
  HandStaticGesture[HandStaticGesture["ThumbUp"] = 6] = "ThumbUp";
  HandStaticGesture[HandStaticGesture["ThumbDown"] = 7] = "ThumbDown";
  HandStaticGesture[HandStaticGesture["Rock"] = 8] = "Rock";
  HandStaticGesture[HandStaticGesture["Namaste"] = 9] = "Namaste";
  HandStaticGesture[HandStaticGesture["PalmUp"] = 10] = "PalmUp";
  HandStaticGesture[HandStaticGesture["Fist"] = 11] = "Fist";
  HandStaticGesture[HandStaticGesture["IndexFingerUp"] = 12] = "IndexFingerUp";
  HandStaticGesture[HandStaticGesture["DoubleFingerUp"] = 13] = "DoubleFingerUp";
  HandStaticGesture[HandStaticGesture["Victory"] = 14] = "Victory";
  HandStaticGesture[HandStaticGesture["BigV"] = 15] = "BigV";
  HandStaticGesture[HandStaticGesture["PhoneCall"] = 16] = "PhoneCall";
  HandStaticGesture[HandStaticGesture["Beg"] = 17] = "Beg";
  HandStaticGesture[HandStaticGesture["Thanks"] = 18] = "Thanks";
  HandStaticGesture[HandStaticGesture["Unknown"] = 19] = "Unknown";
  HandStaticGesture[HandStaticGesture["Cabbage"] = 20] = "Cabbage";
  HandStaticGesture[HandStaticGesture["Three"] = 21] = "Three";
  HandStaticGesture[HandStaticGesture["Four"] = 22] = "Four";
  HandStaticGesture[HandStaticGesture["Pistol"] = 23] = "Pistol";
  HandStaticGesture[HandStaticGesture["Rock2"] = 24] = "Rock2";
  HandStaticGesture[HandStaticGesture["Swear"] = 25] = "Swear";
  HandStaticGesture[HandStaticGesture["HoldFace"] = 26] = "HoldFace";
  HandStaticGesture[HandStaticGesture["Salute"] = 27] = "Salute";
  HandStaticGesture[HandStaticGesture["Spread"] = 28] = "Spread";
  HandStaticGesture[HandStaticGesture["Pray"] = 29] = "Pray";
  HandStaticGesture[HandStaticGesture["QiGong"] = 30] = "QiGong";
  HandStaticGesture[HandStaticGesture["Slide"] = 31] = "Slide";
  HandStaticGesture[HandStaticGesture["PalmDown"] = 32] = "PalmDown";
  HandStaticGesture[HandStaticGesture["Pistol2"] = 33] = "Pistol2";
  HandStaticGesture[HandStaticGesture["NinjaMudra1"] = 34] = "NinjaMudra1";
  HandStaticGesture[HandStaticGesture["NinjaMudra2"] = 35] = "NinjaMudra2";
  HandStaticGesture[HandStaticGesture["NinjaMudra3"] = 36] = "NinjaMudra3";
  HandStaticGesture[HandStaticGesture["NinjaMudra4"] = 37] = "NinjaMudra4";
  HandStaticGesture[HandStaticGesture["NinjaMudra5"] = 38] = "NinjaMudra5";
  HandStaticGesture[HandStaticGesture["NinjaMudra6"] = 39] = "NinjaMudra6";
  HandStaticGesture[HandStaticGesture["NinjaMudra7"] = 40] = "NinjaMudra7";
  HandStaticGesture[HandStaticGesture["NinjaMudra8"] = 41] = "NinjaMudra8";
  HandStaticGesture[HandStaticGesture["NinjaMudra9"] = 42] = "NinjaMudra9";
  HandStaticGesture[HandStaticGesture["NinjaMudra10"] = 43] = "NinjaMudra10";
  HandStaticGesture[HandStaticGesture["NinjaMudra11"] = 44] = "NinjaMudra11";
  HandStaticGesture[HandStaticGesture["SpiderHand"] = 45] = "SpiderHand";
  HandStaticGesture[HandStaticGesture["AvengerHand"] = 46] = "AvengerHand";
  HandStaticGesture[HandStaticGesture["MaxCount"] = 47] = "MaxCount";
  HandStaticGesture[HandStaticGesture["Undetect"] = 48] = "Undetect";
  HandStaticGesture[HandStaticGesture["None"] = 99] = "None";
})(exports.HandStaticGesture || (exports.HandStaticGesture = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Hand dynamic gesture.
 * @property {number} None Unknown or no dynamic gesture detected.
 * @property {number} Punching One punch to the camera.
 * @property {number} Clapping Clapping using two hands.
 * @property {number} HighFive High five with the camera.
 * @sdk 9.8.0
 */




(function (HandDynamicGesture) {
  HandDynamicGesture[HandDynamicGesture["None"] = 0] = "None";
  HandDynamicGesture[HandDynamicGesture["Punching"] = 1] = "Punching";
  HandDynamicGesture[HandDynamicGesture["Clapping"] = 2] = "Clapping";
  HandDynamicGesture[HandDynamicGesture["HighFive"] = 4] = "HighFive";
})(exports.HandDynamicGesture || (exports.HandDynamicGesture = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Key point of hand tracking algorithm result.
 * @property {number} Wrist
 * @property {number} Thumb3
 * @property {number} Thumb2
 * @property {number} Thumb1
 * @property {number} Thumb0
 * @property {number} Index3
 * @property {number} Index2
 * @property {number} Index1
 * @property {number} Index0
 * @property {number} Middle3
 * @property {number} Middle2
 * @property {number} Middle1
 * @property {number} Middle0
 * @property {number} Ring3
 * @property {number} Ring2
 * @property {number} Ring1
 * @property {number} Ring0
 * @property {number} Pinky3
 * @property {number} Pinky2
 * @property {number} Pinky1
 * @property {number} Pinky0
 * @property {number} Center
 * @sdk 9.8.0
 */




(function (HandKeyPoint) {
  HandKeyPoint[HandKeyPoint["Wrist"] = 0] = "Wrist";
  HandKeyPoint[HandKeyPoint["Thumb3"] = 1] = "Thumb3";
  HandKeyPoint[HandKeyPoint["Thumb2"] = 2] = "Thumb2";
  HandKeyPoint[HandKeyPoint["Thumb1"] = 3] = "Thumb1";
  HandKeyPoint[HandKeyPoint["Thumb0"] = 4] = "Thumb0";
  HandKeyPoint[HandKeyPoint["Index3"] = 5] = "Index3";
  HandKeyPoint[HandKeyPoint["Index2"] = 6] = "Index2";
  HandKeyPoint[HandKeyPoint["Index1"] = 7] = "Index1";
  HandKeyPoint[HandKeyPoint["Index0"] = 8] = "Index0";
  HandKeyPoint[HandKeyPoint["Middle3"] = 9] = "Middle3";
  HandKeyPoint[HandKeyPoint["Middle2"] = 10] = "Middle2";
  HandKeyPoint[HandKeyPoint["Middle1"] = 11] = "Middle1";
  HandKeyPoint[HandKeyPoint["Middle0"] = 12] = "Middle0";
  HandKeyPoint[HandKeyPoint["Ring3"] = 13] = "Ring3";
  HandKeyPoint[HandKeyPoint["Ring2"] = 14] = "Ring2";
  HandKeyPoint[HandKeyPoint["Ring1"] = 15] = "Ring1";
  HandKeyPoint[HandKeyPoint["Ring0"] = 16] = "Ring0";
  HandKeyPoint[HandKeyPoint["Pinky3"] = 17] = "Pinky3";
  HandKeyPoint[HandKeyPoint["Pinky2"] = 18] = "Pinky2";
  HandKeyPoint[HandKeyPoint["Pinky1"] = 19] = "Pinky1";
  HandKeyPoint[HandKeyPoint["Pinky0"] = 20] = "Pinky0";
  HandKeyPoint[HandKeyPoint["Center"] = 21] = "Center";
})(exports.HandKeyPoint || (exports.HandKeyPoint = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description BodyEvent indicates body tracking status.
 * @property {string} Detected Body detected.
 * @property {string} Lost Lose track of a body.
 * @property {string} Action Recognize an action of a body.
 * @sdk 9.8.0
 */




(function (BodyEvent) {
  BodyEvent["Detected"] = "detected";
  BodyEvent["Lost"] = "lost";
  BodyEvent["Action"] = "action";
})(exports.BodyEvent || (exports.BodyEvent = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Key point of skeleton2d algorithm result.
 * @property {number} Nose
 * @property {number} Neck
 * @property {number} RightShoulder
 * @property {number} RightElbow
 * @property {number} RightWrist
 * @property {number} LeftShoulder
 * @property {number} LeftElbow
 * @property {number} LeftWrist
 * @property {number} RightHip
 * @property {number} RightKnee
 * @property {number} RightAnkle
 * @property {number} LeftHip
 * @property {number} LeftKnee
 * @property {number} LeftAnkle
 * @property {number} RightEye
 * @property {number} LeftEye
 * @property {number} RightEar
 * @property {number} LeftEar
 * @sdk 9.8.0
 */




(function (Body2DKeyPointType) {
  Body2DKeyPointType[Body2DKeyPointType["Nose"] = 0] = "Nose";
  Body2DKeyPointType[Body2DKeyPointType["Neck"] = 1] = "Neck";
  Body2DKeyPointType[Body2DKeyPointType["RightShoulder"] = 2] = "RightShoulder";
  Body2DKeyPointType[Body2DKeyPointType["RightElbow"] = 3] = "RightElbow";
  Body2DKeyPointType[Body2DKeyPointType["RightWrist"] = 4] = "RightWrist";
  Body2DKeyPointType[Body2DKeyPointType["LeftShoulder"] = 5] = "LeftShoulder";
  Body2DKeyPointType[Body2DKeyPointType["LeftElbow"] = 6] = "LeftElbow";
  Body2DKeyPointType[Body2DKeyPointType["LeftWrist"] = 7] = "LeftWrist";
  Body2DKeyPointType[Body2DKeyPointType["RightHip"] = 8] = "RightHip";
  Body2DKeyPointType[Body2DKeyPointType["RightKnee"] = 9] = "RightKnee";
  Body2DKeyPointType[Body2DKeyPointType["RightAnkle"] = 10] = "RightAnkle";
  Body2DKeyPointType[Body2DKeyPointType["LeftHip"] = 11] = "LeftHip";
  Body2DKeyPointType[Body2DKeyPointType["LeftKnee"] = 12] = "LeftKnee";
  Body2DKeyPointType[Body2DKeyPointType["LeftAnkle"] = 13] = "LeftAnkle";
  Body2DKeyPointType[Body2DKeyPointType["RightEye"] = 14] = "RightEye";
  Body2DKeyPointType[Body2DKeyPointType["LeftEye"] = 15] = "LeftEye";
  Body2DKeyPointType[Body2DKeyPointType["RightEar"] = 16] = "RightEar";
  Body2DKeyPointType[Body2DKeyPointType["LeftEar"] = 17] = "LeftEar";
})(exports.Body2DKeyPointType || (exports.Body2DKeyPointType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description Key point of avatar3d algorithm result.
 * @property {number} Hips
 * @property {number} LeftUpLeg
 * @property {number} RightUpLeg
 * @property {number} Spine
 * @property {number} LeftLeg
 * @property {number} RightLeg
 * @property {number} Spine1
 * @property {number} LeftFoot
 * @property {number} RightFoot
 * @property {number} Spine2
 * @property {number} LeftToe
 * @property {number} RightToe
 * @property {number} Neck
 * @property {number} LeftShoulder
 * @property {number} RightShoulder
 * @property {number} Head
 * @property {number} LeftArm
 * @property {number} RightArm
 * @property {number} LeftForeArm
 * @property {number} RightForeArm
 * @property {number} LeftHand
 * @property {number} RightHand
 * @sdk 9.8.0
 */




(function (Body3DKeyPointType) {
  Body3DKeyPointType[Body3DKeyPointType["Hips"] = 0] = "Hips";
  Body3DKeyPointType[Body3DKeyPointType["LeftUpLeg"] = 1] = "LeftUpLeg";
  Body3DKeyPointType[Body3DKeyPointType["RightUpLeg"] = 2] = "RightUpLeg";
  Body3DKeyPointType[Body3DKeyPointType["Spine"] = 3] = "Spine";
  Body3DKeyPointType[Body3DKeyPointType["LeftLeg"] = 4] = "LeftLeg";
  Body3DKeyPointType[Body3DKeyPointType["RightLeg"] = 5] = "RightLeg";
  Body3DKeyPointType[Body3DKeyPointType["Spine1"] = 6] = "Spine1";
  Body3DKeyPointType[Body3DKeyPointType["LeftFoot"] = 7] = "LeftFoot";
  Body3DKeyPointType[Body3DKeyPointType["RightFoot"] = 8] = "RightFoot";
  Body3DKeyPointType[Body3DKeyPointType["Spine2"] = 9] = "Spine2";
  Body3DKeyPointType[Body3DKeyPointType["LeftToe"] = 10] = "LeftToe";
  Body3DKeyPointType[Body3DKeyPointType["RightToe"] = 11] = "RightToe";
  Body3DKeyPointType[Body3DKeyPointType["Neck"] = 12] = "Neck";
  Body3DKeyPointType[Body3DKeyPointType["LeftShoulder"] = 13] = "LeftShoulder";
  Body3DKeyPointType[Body3DKeyPointType["RightShoulder"] = 14] = "RightShoulder";
  Body3DKeyPointType[Body3DKeyPointType["Head"] = 15] = "Head";
  Body3DKeyPointType[Body3DKeyPointType["LeftArm"] = 16] = "LeftArm";
  Body3DKeyPointType[Body3DKeyPointType["RightArm"] = 17] = "RightArm";
  Body3DKeyPointType[Body3DKeyPointType["LeftForeArm"] = 18] = "LeftForeArm";
  Body3DKeyPointType[Body3DKeyPointType["RightForeArm"] = 19] = "RightForeArm";
  Body3DKeyPointType[Body3DKeyPointType["LeftHand"] = 20] = "LeftHand";
  Body3DKeyPointType[Body3DKeyPointType["RightHand"] = 21] = "RightHand";
})(exports.Body3DKeyPointType || (exports.Body3DKeyPointType = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description AvatarDriveEvent indicates AvatarDrive face tracking status.
 * @property {string} Detected AvatarDrive face detected.
 * @property {string} Lost Lose track of a face.
 * @sdk 9.8.0
 */




(function (AvatarDriveEvent) {
  AvatarDriveEvent["Detected"] = "detected";
  AvatarDriveEvent["Lost"] = "lost";
})(exports.AvatarDriveEvent || (exports.AvatarDriveEvent = {}));
/**
 * @enum {enum}
 * @memberof amg
 * @description AvatarDriveBlendShapeType indicates the factor of expression blending shapes, and the definition of blending shapes is the same as Apple ARkit, with 52 blending shapes. The enum value indicates the index of the type in the channels array.
 * @property {number} LeftEyeLookDown
 * @property {number} LeftNoseSneer
 * @property {number} LeftEyeLookIn
 * @property {number} BrowInnerUp
 * @property {number} LeftEyeSquint
 * @property {number} MouthClose
 * @property {number} RightMouthLowerDown
 * @property {number} JawOpen
 * @property {number} MouthShrugLower
 * @property {number} LeftMouthLowerDown
 * @property {number} MouthFunnel
 * @property {number} RightEyeLookIn
 * @property {number} RightEyeLookDown
 * @property {number} RightNoseSneer
 * @property {number} MouthRollUpper
 * @property {number} JawRight
 * @property {number} LeftMouthDimple
 * @property {number} MouthRollLower
 * @property {number} LeftMouthSmile
 * @property {number} LeftMouthPress
 * @property {number} RightMouthSmile
 * @property {number} RightMouthPress
 * @property {number} RightMouthDimple
 * @property {number} MouthLeft
 * @property {number} RightBrowDown
 * @property {number} LeftBrowDown
 * @property {number} LeftMouthFrown
 * @property {number} LeftEyeBlink
 * @property {number} LeftCheekSquint
 * @property {number} LeftBrowOuterUp
 * @property {number} LeftEyeLookUp
 * @property {number} JawLeft
 * @property {number} LeftMouthStretch
 * @property {number} RightMouthStretch
 * @property {number} MouthPucker
 * @property {number} RightEyeLookUp
 * @property {number} RightBrowOuterUp
 * @property {number} RightCheekSquint
 * @property {number} RightEyeBlink
 * @property {number} LeftMouthUpperUp
 * @property {number} RightMouthFrown
 * @property {number} RightEyeSquint
 * @property {number} JawForward
 * @property {number} RightMouthUpperUp
 * @property {number} CheekPuff
 * @property {number} LeftEyeLookOut
 * @property {number} RightEyeLookOut
 * @property {number} RightEyeWide
 * @property {number} MouthRight
 * @property {number} LeftEyeWide
 * @property {number} MouthShrugUpper
 * @property {number} TongueOut
 * @sdk 9.8.0
 */




(function (AvatarDriveBlendShapeType) {
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeLookDown"] = 0] = "LeftEyeLookDown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftNoseSneer"] = 1] = "LeftNoseSneer";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeLookIn"] = 2] = "LeftEyeLookIn";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["BrowInnerUp"] = 3] = "BrowInnerUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeSquint"] = 4] = "LeftEyeSquint";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthClose"] = 5] = "MouthClose";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthLowerDown"] = 6] = "RightMouthLowerDown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["JawOpen"] = 7] = "JawOpen";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthShrugLower"] = 8] = "MouthShrugLower";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthLowerDown"] = 9] = "LeftMouthLowerDown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthFunnel"] = 10] = "MouthFunnel";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeLookIn"] = 11] = "RightEyeLookIn";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeLookDown"] = 12] = "RightEyeLookDown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightNoseSneer"] = 13] = "RightNoseSneer";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthRollUpper"] = 14] = "MouthRollUpper";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["JawRight"] = 15] = "JawRight";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthDimple"] = 16] = "LeftMouthDimple";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthRollLower"] = 17] = "MouthRollLower";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthSmile"] = 18] = "LeftMouthSmile";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthPress"] = 19] = "LeftMouthPress";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthSmile"] = 20] = "RightMouthSmile";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthPress"] = 21] = "RightMouthPress";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthDimple"] = 22] = "RightMouthDimple";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthLeft"] = 23] = "MouthLeft";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightBrowDown"] = 24] = "RightBrowDown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftBrowDown"] = 25] = "LeftBrowDown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthFrown"] = 26] = "LeftMouthFrown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeBlink"] = 27] = "LeftEyeBlink";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftCheekSquint"] = 28] = "LeftCheekSquint";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftBrowOuterUp"] = 29] = "LeftBrowOuterUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeLookUp"] = 30] = "LeftEyeLookUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["JawLeft"] = 31] = "JawLeft";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthStretch"] = 32] = "LeftMouthStretch";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthStretch"] = 33] = "RightMouthStretch";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthPucker"] = 34] = "MouthPucker";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeLookUp"] = 35] = "RightEyeLookUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightBrowOuterUp"] = 36] = "RightBrowOuterUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightCheekSquint"] = 37] = "RightCheekSquint";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeBlink"] = 38] = "RightEyeBlink";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftMouthUpperUp"] = 39] = "LeftMouthUpperUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthFrown"] = 40] = "RightMouthFrown";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeSquint"] = 41] = "RightEyeSquint";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["JawForward"] = 42] = "JawForward";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightMouthUpperUp"] = 43] = "RightMouthUpperUp";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["CheekPuff"] = 44] = "CheekPuff";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeLookOut"] = 45] = "LeftEyeLookOut";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeLookOut"] = 46] = "RightEyeLookOut";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["RightEyeWide"] = 47] = "RightEyeWide";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthRight"] = 48] = "MouthRight";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["LeftEyeWide"] = 49] = "LeftEyeWide";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["MouthShrugUpper"] = 50] = "MouthShrugUpper";
  AvatarDriveBlendShapeType[AvatarDriveBlendShapeType["TongueOut"] = 51] = "TongueOut";
})(exports.AvatarDriveBlendShapeType || (exports.AvatarDriveBlendShapeType = {}));



(function (AssetType) {
  AssetType["Texture"] = "texture";
  AssetType["Mesh"] = "mesh";
})(exports.AssetType || (exports.AssetType = {}));



(function (AssetSubType) {
  AssetSubType["Segmentation"] = "segmentation";
  AssetSubType["Face"] = "face";
  AssetSubType["CameraInput"] = "cameraInput";
})(exports.AssetSubType || (exports.AssetSubType = {}));

const props = ['clearColor', 'clearColorBuffer', 'clearDepthBuffer', 'clearStencilBuffer', 'orthoHeight', 'near', 'far', 'fov', 'type', 'viewport', 'layers', 'renderOrder'];
/**
 * @class
 * @category Component
 * @name CameraComponent
 * @augments Component
 * @classdesc CameraComponent class for rendering camera.
 * @description Constructor to create an CameraComponent instance.
 * To add an CameraComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create CameraComponent.
 * @example
 * // add CameraComponent to entity
 * entity.addComponent('Camera', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class CameraComponent extends Component {
  constructor(entity, options) {
    if (entity && options) {
      super(entity, 'Camera');
      const mask = new Amaz.DynamicBitset(EntityLayerMax, 0);
      mask.set(0, 1);
      this.native.layerVisibleMask = mask;
      this.initialize(options, props); // Todo: implement renderTarget API

      this.native.renderTexture = new Amaz.SceneOutputRT();
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new CameraComponent();

    if (native instanceof Amaz.Camera) {
      component.initWithNative(entity, native, 'Camera');
    } else {
      throw new Error('Incorrect argument to CameraComponent::fromNative');
    }

    return component;
  }
  /**
   * @name CameraComponent#renderTexture
   * @type {RenderTexture}
   * @description Target texture for rendering.
   * @sdk 9.8.0
   */


  get renderTexture() {
    return this.native.renderTexture;
  }

  set renderTexture(value) {
    this.native.renderTexture = value;
  }
  /**
   * @name CameraComponent#clearColor
   * @type {Color}
   * @description Color used to clear color buffer.
   * @sdk 9.8.0
   */


  get clearColor() {
    return this.native.clearColor;
  }

  set clearColor(value) {
    this.native.clearColor = value;
  }
  /**
   * @name CameraComponent#clearColorBuffer
   * @type {boolean}
   * @description Flag to clear color buffer.
   * @sdk 9.8.0
   */


  get clearColorBuffer() {
    const type = this.native.clearType;
    return type === 1 || type === 3 || type === 7;
  }

  set clearColorBuffer(value) {
    let type = this.native.clearType;

    switch (type) {
      case 0:
      case 4:
      case 5:
        type = value ? 1 : type;
        break;

      case 1:
        type = value ? 1 : 5;
        break;

      case 2:
      case 3:
        type = value ? 3 : 2;
        break;

      case 6:
      case 7:
        type = value ? 7 : 6;
        break;
    }

    this.native.clearType = type;
  }
  /**
   * @name CameraComponent#clearDepthBuffer
   * @type {boolean}
   * @description Flag to clear depth buffer.
   * @sdk 9.8.0
   */


  get clearDepthBuffer() {
    const type = this.native.clearType;
    return type === 2 || type === 3 || type === 6 || type === 7;
  }

  set clearDepthBuffer(value) {
    let type = this.native.clearType;

    switch (type) {
      case 0:
      case 4:
      case 5:
        type = value ? 2 : type;
        break;

      case 1:
      case 3:
        type = value ? 3 : 1;
        break;

      case 2:
        type = value ? value : 5;
        break;

      case 6:
        type = value ? 6 : 5;
        break;

      case 7:
        type = value ? 7 : 1;
        break;
    }

    this.native.clearType = type;
  }
  /**
   * @name CameraComponent#clearStencilBuffer
   * @type {boolean}
   * @description Flag to clear stencil buffer.
   * @sdk 9.8.0
   */


  get clearStencilBuffer() {
    const type = this.native.clearType;
    return type === 6 || type === 7;
  }

  set clearStencilBuffer(value) {
    let type = this.native.clearType;

    switch (type) {
      case 0:
      case 4:
      case 5:
        type = value ? 6 : type;
        break;

      case 1:
      case 3:
        type = value ? 7 : type;
        break;

      case 2:
      case 6:
        type = value ? 6 : 2;
        break;

      case 7:
        type = value ? 7 : 1;
        break;
    }

    this.native.clearType = type;
  }
  /**
   * @name CameraComponent#orthoHeight
   * @type {number}
   * @description Camera's half-size when in orthographic mode.
   * @sdk 9.8.0
   */


  get orthoHeight() {
    return this.native.orthoScale;
  }

  set orthoHeight(value) {
    this.native.orthoScale = value;
  }
  /**
   * @name CameraComponent#near
   * @type {number}
   * @description Camera's near distance.
   * @sdk 9.8.0
   */


  get near() {
    return this.native.zNear;
  }

  set near(value) {
    this.native.zNear = value;
  }
  /**
   * @name CameraComponent#far
   * @type {number}
   * @description Camera's far distance.
   * @sdk 9.8.0
   */


  get far() {
    return this.native.zFar;
  }

  set far(value) {
    this.native.zFar = value;
  }
  /**
   * @name CameraComponent#fov
   * @type {number}
   * @description Camera's field of view angle (in degrees).
   * @sdk 9.8.0
   */


  get fov() {
    return this.native.fovy;
  }

  set fov(value) {
    this.native.fovy = value;
  }
  /**
   * @name CameraComponent#type
   * @type {amg.CameraType}
   * @description Camera's type.
   * @sdk 9.8.0
   */


  get type() {
    return this.native.type;
  }

  set type(value) {
    this.native.type = value;
  }
  /**
   * @name CameraComponent#viewport
   * @type {Rect}
   * @description Camera's viewport.
   * @sdk 9.8.0
   */


  get viewport() {
    return this.native.viewport;
  }

  set viewport(value) {
    this.native.viewport = value;
  }
  /**
   * @name CameraComponent#layers
   * @type {number[]}
   * @description Camera's rendering layers.
   * @sdk 9.8.0
   */


  get layers() {
    const layerArray = [];

    for (let i = 0; i < EntityLayerMax; ++i) {
      if (this.native.layerVisibleMask.test(i)) {
        layerArray.push(i);
      }
    }

    return layerArray;
  }

  set layers(value) {
    const mask = new Amaz.DynamicBitset(EntityLayerMax, 0);

    for (const i of value) {
      if (0 <= i && i < EntityLayerMax) {
        mask.set(i);
      } else {
        throw new Error('Invalid layer value!');
      }
    }

    this.native.layerVisibleMask = mask;
  }
  /**
   * @name CameraComponent#renderOrder
   * @type {number}
   * @description Camera's rendering order.
   * @sdk 9.8.0
   */


  get renderOrder() {
    return this.native.renderOrder;
  }

  set renderOrder(value) {
    this.native.renderOrder = value;
  }
  /**
   * @function
   * @name CameraComponent#screenToWorld
   * @description Convert 2D point to 3D point.
   * @param {Vec3} point - 2D point with desired z.
   * @returns {Vec3} 3D point.
   * @sdk 9.8.0
   */


  screenToWorld(point) {
    return this.native.screenToWorldPoint(point);
  }
  /**
   * @function
   * @name CameraComponent#worldToScreen
   * @description Convert 3D point to 2D point.
   * @param {Vec3} point - 3D point.
   * @returns {Vec3} 2D point with z.
   * @sdk 9.8.0
   */


  worldToScreen(point) {
    return this.native.worldToScreenPoint(point);
  }

}

const props$1 = ['type', 'offset', 'halfExtents', 'radius', 'height'];
const shapeToClassMap = /*#__PURE__*/new Map([[exports.Collider3DType.Box, 'BoxCollider3D'], [exports.Collider3DType.Sphere, 'SphereCollider3D'], [exports.Collider3DType.Capsule, 'CapsuleCollider3D']]);
/**
 * @param type
 */

function shapeToClass(type) {
  if (!shapeToClassMap.has(type)) {
    throw new Error('Unknown type of shape');
  }

  return shapeToClassMap.get(type);
}
/**
 * @class
 * @category Component
 * @name Collider3DComponent
 * @augments Component
 * @classdesc Collider3DComponent class for 3d collision shapes.
 * @description Constructor to create an Collider3DComponent instance.
 * To add an Collider3DComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create Collider3DComponent.
 * @param {amg.Collider3DType} options.type - Collider's type.
 * @example
 * // add Collider3DComponent to entity
 * entity.addComponent('Collider3D', options);
 * @hideconstructor
 * @sdk 9.8.0
 */


class Collider3DComponent extends Component {
  constructor(entity, options) {
    if (entity && options && options.hasOwnProperty('type')) {
      super(entity, shapeToClass(options['type']));
      this.initialize(options, props$1);
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new Collider3DComponent();

    if (native instanceof Amaz.BoxCollider3D) {
      component.initWithNative(entity, native, 'BoxCollider3D');
      component.type = exports.Collider3DType.Box;
    } else if (native instanceof Amaz.SphereCollider3D) {
      component.initWithNative(entity, native, 'SphereCollider3D');
      component.type = exports.Collider3DType.Sphere;
    } else if (native instanceof Amaz.CapsuleCollider3D) {
      component.initWithNative(entity, native, 'CapsuleCollider3D');
      component.type = exports.Collider3DType.Capsule;
    } else {
      throw new Error('Incorrect argument to CollisionComponent::fromNative');
    }

    return component;
  }
  /**
   * @name Collider3DComponent#offset
   * @type {Vec3}
   * @description Offset from entity's position.
   * @sdk 9.8.0
   */


  get offset() {
    return this.native.offset;
  }

  set offset(value) {
    this.native.offset = value;
  }
  /**
   * @name Collider3DComponent#radius
   * @type {number}
   * @description Collider's radius.
   * @sdk 9.8.0
   */


  get radius() {
    return this.native.radius;
  }

  set radius(value) {
    this.native.radius = value;
  }
  /**
   * @name Collider3DComponent#height
   * @type {number}
   * @description Collider's height.
   * @sdk 9.8.0
   */


  get height() {
    return this.native.height;
  }

  set height(value) {
    this.native.height = value;
  }
  /**
   * @name Collider3DComponent#halfExtents
   * @type {Vec3}
   * @description Collider's halfExtents.
   * @sdk 9.8.0
   */


  get halfExtents() {
    return this.native.halfExtent;
  }

  set halfExtents(value) {
    this.native.halfExtent = value;
  }

}

/**
 * @class
 * @category Math
 * @name Color
 * @classdesc Basic color class.
 * @description Constructor to create an Color instance.
 * @param {number} r - Red component (0.0 - 1.0).
 * @param {number} g - Green component (0.0 - 1.0).
 * @param {number} b - Blue component (0.0 - 1.0).
 * @param {number} a - Alhpha component (0.0 - 1.0).
 * @sdk 9.8.0
 */

var Color = Amaz.Color;

/**
 * @class
 * @category Math
 * @name Vec3
 * @classdesc Class for math 3d vector.
 * @description Constructor to create an Vec3 instance.
 * @param {number} x - x component.
 * @param {number} y - y component.
 * @param {number} z - z component.
 * @sdk 9.8.0
 */

var Vec3 = Amaz.Vector3f;
/**
 * @function
 * @name Vec3#clone
 * @description Clone target vector.
 * @returns {Vec3} A clone of the target vector.
 * @sdk 9.8.0
 */

Vec3.prototype.clone = function () {
  return this.copy();
};
/**
 * @function
 * @name Vec3#subtract
 * @description Subtract 2 vectors in the arguments or target vector and 1st argument.
 * @param {Vec3} a - 1st argument.
 * @param {Vec3} b - 2nd argument.
 * @returns {Vec3} Result of the subtraction.
 * @sdk 9.8.0
 */


Vec3.prototype.subtract = function (a, b) {
  if (b) {
    const ret = Vec3.sub(a, b);
    this.set(ret.x, ret.y, ret.z);
  } else {
    this.sub(a);
  }

  return this;
};
/**
 * @function
 * @name Vec3#cross2
 * @description Calculate the cross product of 2 vectors.
 * @param {Vec3} a - 1st argument.
 * @param {Vec3} b - 2nd argument.
 * @returns {Vec3} Result of the cross product.
 * @sdk 9.8.0
 */


Vec3.prototype.cross2 = function (a, b) {
  const ret = a.cross(b);
  this.set(ret.x, ret.y, ret.z);
  return this;
};

const classMap = /*#__PURE__*/new Map([[exports.LightType.Directional, 'DirectionalLight'], [exports.LightType.Point, 'PointLight'], [exports.LightType.Spot, 'SpotLight']]);
/**
 * @param {amg.LightType} type
 */

function lightTypeToClass(type) {
  if (!classMap.has(type)) {
    throw new Error('Unknown type of light');
  }

  return classMap.get(type);
}

const props$2 = ['type', 'color', 'intensity', 'castShadow', 'enableSoftShadow', 'shadowSoftness', 'shadowBias', 'camera', 'shadowResolution', 'attenuationRange'];
/**
 * @class
 * @category Component
 * @name LightComponent
 * @augments Component
 * @classdesc LightComponent class for lighting.
 * @description Constructor to create an LightComponent instance.
 * To add an LightComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create LightComponent.
 * @param {amg.LightType} options.type - Type of light.
 * @example
 * // add LightComponent to entity
 * entity.addComponent('Light', {type: amg.LightType.Directional});
 * @hideconstructor
 * @sdk 9.8.0
 */

class LightComponent extends Component {
  constructor(entity, options) {
    if (entity && options && options.hasOwnProperty('type')) {
      super(entity, lightTypeToClass(options['type']));
      this.initialize(options, props$2);
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new LightComponent();

    if (native instanceof Amaz.DirectionalLight) {
      component.initWithNative(entity, native, 'DirectionalLight');
      component.type = exports.LightType.Directional;
    } else if (native instanceof Amaz.PointLight) {
      component.initWithNative(entity, native, 'PointLight');
      component.type = exports.LightType.Point;
    } else if (native instanceof Amaz.SpotLight) {
      component.initWithNative(entity, native, 'SpotLight');
      component.type = exports.LightType.Spot;
    } else {
      throw new Error('Incorrect argument to LightComponent::fromNative');
    }

    return component;
  }
  /**
   * @name LightComponent#color
   * @type {Color}
   * @description Light's color.
   * @sdk 9.8.0
   */


  get color() {
    const color = this.native.color;
    return new Color(color.x, color.y, color.z, 1.0);
  }

  set color(value) {
    this.native.color = new Vec3(value.r, value.g, value.b);
  }
  /**
   * @name LightComponent#intensity
   * @type {number}
   * @description Light's intensity.
   * @sdk 9.8.0
   */


  get intensity() {
    return this.native.intensiy;
  }

  set intensity(value) {
    this.native.intensiy = value;
  }
  /**
   * @name LightComponent#castShadow
   * @type {boolean}
   * @description Light's cast shadow flag.
   * @sdk 9.8.0
   */


  get castShadow() {
    return this.native.shadowEnableNew;
  }

  set castShadow(value) {
    this.native.shadowEnableNew = value;
  }
  /**
   * @name LightComponent#enableSoftShadow
   * @type {boolean}
   * @description Light's enable soft shadow flag.
   * @sdk 9.8.0
   */


  get enableSoftShadow() {
    return this.native.useSoftShadow;
  }

  set enableSoftShadow(value) {
    this.native.useSoftShadow = value;
  }
  /**
   * @name LightComponent#shadowSoftness
   * @type {number}
   * @description Light's shadow softness.
   * @sdk 9.8.0
   */


  get shadowSoftness() {
    return this.native.shadowSoftness;
  }

  set shadowSoftness(value) {
    this.native.shadowSoftness = value;
  }
  /**
   * @name LightComponent#shadowBias
   * @type {number}
   * @description Light's shadow sias.
   * @sdk 9.8.0
   */


  get shadowBias() {
    return this.native.shadowBias;
  }

  set shadowBias(value) {
    this.native.shadowBias = value;
  }
  /**
   * @name LightComponent#shadowResolution
   * @type {Vec2}
   * @description Light's shadow resolution.
   * @sdk 9.8.0
   */


  get shadowResolution() {
    return this.native.shadowResolution;
  }

  set shadowResolution(value) {
    this.native.shadowResolution = value;
  }
  /**
   * @name LightComponent#attenuationRange
   * @type {number}
   * @description Light's attenuation range.
   * @sdk 9.8.0
   */


  get attenuationRange() {
    if (this.type === exports.LightType.Point || this.type === exports.LightType.Spot) {
      return this.native.attenuationRange;
    } else {
      throw new Error('Light Type does not support attenuationRange!');
    }
  }

  set attenuationRange(value) {
    if (this.type === exports.LightType.Point || this.type === exports.LightType.Spot) {
      this.native.attenuationRange = value;
    } else {
      throw new Error('Light Type does not support attenuationRange!');
    }
  }
  /**
   * @name LightComponent#camera
   * @type {Entity}
   * @description Light's camera for shadow.
   * @sdk 9.8.0
   */


  get camera() {
    if (this.type === exports.LightType.Directional) {
      var _this$entity, _this$entity$scene, _this$native, _this$native$mainCame;

      return (_this$entity = this.entity) == null ? void 0 : (_this$entity$scene = _this$entity.scene) == null ? void 0 : _this$entity$scene.entityFromNative((_this$native = this.native) == null ? void 0 : (_this$native$mainCame = _this$native.mainCamera) == null ? void 0 : _this$native$mainCame.entity);
    } else {
      return undefined;
    }
  }

  set camera(value) {
    if (this.type === exports.LightType.Directional) {
      if (value) {
        if (value.native) {
          this.native.mainCamera = value.native.getComponent('Transform');
        } else {
          throw new Error('Invalid camera!');
        }
      }
    } else {
      throw new Error('Only directional light needs cameera for shadow optimization!');
    }
  }

}

/**
 * @class
 * @category Math
 * @name Vec2
 * @classdesc Class for math 2d vector.
 * @description Constructor to create an Vec2 instance.
 * @param {number} x - x component.
 * @param {number} y - y component.
 * @sdk 9.8.0
 */

var Vec2 = Amaz.Vector2f;

/**
 * @class
 * @category Math
 * @name Vec4
 * @classdesc Class for math 4d vector.
 * @description Constructor to create an Vec3 instance.
 * @param {number} x - x component.
 * @param {number} y - y component.
 * @param {number} z - z component.
 * @param {number} w - w component.
 * @sdk 9.8.0
 */

var Vec4 = Amaz.Vector4f;
/**
 * @function
 * @name Vec4#clone
 * @description Clone target vector.
 * @returns {Vec4} A clone of the target vector.
 * @sdk 9.8.0
 */

Vec4.prototype.clone = function () {
  return this.copy();
};

/**
 * @class
 * @category Math
 * @name Mat4
 * @classdesc Class for math matrix 4x4.
 * @description Constructor to create an Mat4 instance.
 * @param {number} m0 - 1st element of the matrix.
 * @param {number} m1 - 2nd element of the matrix.
 * @param {number} m2 - 3rd element of the matrix.
 * @param {number} m3 - 4th element of the matrix.
 * @param {number} m4 - 5th element of the matrix.
 * @param {number} m5 - 6th element of the matrix.
 * @param {number} m6 - 7th element of the matrix.
 * @param {number} m7 - 8th element of the matrix.
 * @param {number} m8 - 9th element of the matrix.
 * @param {number} m9 - 10th element of the matrix.
 * @param {number} m10 - 11th element of the matrix.
 * @param {number} m11 - 12th element of the matrix.
 * @param {number} m12 - 13th element of the matrix.
 * @param {number} m13 - 14th element of the matrix.
 * @param {number} m14 - 15th element of the matrix.
 * @param {number} m15 - 16h element of the matrix.
 * @sdk 9.8.0
 */

var Mat4 = Amaz.Matrix4x4f;

/**
 * @class
 * @category Core
 * @name Material
 * @classdesc Material class.
 * @description Constructor to create Material instance.
 * @sdk 9.8.0
 */

class Material {
  constructor(native) {
    if (native) {
      this.native = native;
    } else {
      this.native = new Amaz.Material();
    }
  }
  /**
   * @name Material#xshader
   * @type {XShader}
   * @description The xshader object.
   * @sdk 9.8.0
   */


  set xshader(value) {
    this.native.xshader = value.native;
  }
  /**
   * @function
   * @name Material#clone
   * @description Clone material to create new one.
   * @returns {Material} Cloned material.
   * @sdk 9.8.0
   */


  clone() {
    return new Material(this.native.instantiate());
  }
  /**
   * @function
   * @name Material#addProperty
   * @description Add a property used as an uniform in the shader to this material, value could be the type of number, Vec2, Vec3, Vec4, Mat4, Color and Texture.
   * @param {string} name Property's name.
   * @param {any} value  Property's value from one of the below types:
   * <table>
   *  <tr><td>number</td></tr>
   *  <tr><td>{@link Vec2}</td></tr>
   *  <tr><td>{@link Vec3}</td></tr>
   *  <tr><td>{@link Vec4}</td></tr>
   *  <tr><td>{@link Color}</td></tr>
   *  <tr><td>{@link Mat4}</td></tr>
   *  <tr><td>{@link Texture}</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  addProperty(name, value) {
    Object.defineProperty(this, name, {
      configurable: true,
      get: function () {
        let ret;

        if (typeof value === 'number') {
          ret = this.native.getFloat(name);
        } else if (value instanceof Vec2) {
          ret = this.native.getVec2(name);
        } else if (value instanceof Vec3) {
          ret = this.native.getVec3(name);
        } else if (value instanceof Vec4) {
          ret = this.native.getVec4(name);
        } else if (value instanceof Amaz.Color) {
          const ve4Value = this.native.getVec4(name);
          ret = new Amaz.Color(ve4Value.x, ve4Value.y, ve4Value.z, ve4Value.w);
        } else if (value instanceof Mat4) {
          ret = this.native.getMat4(name);
        } else {
          ret = this.native.getTex(name);
        }

        return ret;
      },
      set: function (value) {
        if (typeof value === 'number') {
          this.native.setFloat(name, value);
        } else if (value instanceof Vec2) {
          this.native.setVec2(name, value);
        } else if (value instanceof Vec3) {
          this.native.setVec3(name, value);
        } else if (value instanceof Vec4) {
          this.native.setVec4(name, value);
        } else if (value instanceof Amaz.Color) {
          const vec4Value = new Vec4(value.r, value.g, value.b, value.a);
          this.native.setVec4(name, vec4Value);
        } else if (value instanceof Mat4) {
          this.native.setMat4(name, value);
        } else {
          this.native.setTex(name, value);
        }
      }
    });
    this[name] = value;
  }
  /**
   * @function
   * @name Material#removeProperty
   * @description Remove property.
   * @param {string} name Property's name.
   * @sdk 9.8.0
   */


  removeProperty(name) {
    Object.defineProperty(this, name, {
      configurable: true,
      value: undefined
    });
  }
  /**
   * @function
   * @name Material#addMacro
   * @description Add macro and its value.
   * @param {string} name Macro's name.
   * @param {number} value Macro's value.
   * @sdk 9.8.0
   */


  addMacro(name, value) {
    this.native.enableMacro(name, value);
  }
  /**
   * @function
   * @name Material#removeMacro
   * @description Remove macro.
   * @param {string} name Macro's name.
   * @sdk 9.8.0
   */


  removeMacro(name) {
    this.native.disableMacro(name);
  }

}

const props$3 = ['castShadow', 'mesh', 'material'];
/**
 * @class
 * @category Component
 * @name ModelComponent
 * @augments Component
 * @classdesc ModelComponent class for 3d model.
 * @description Constructor to create an ModelComponent instance.
 * To add an ModelComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create ModelComponent.
 * @example
 * // add ModelComponent to entity
 * entity.addComponent('Model', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class ModelComponent extends Component {
  constructor(entity, options) {
    if (entity && options) {
      super(entity, 'MeshRenderer');
      this.initialize(options, props$3);
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new ModelComponent();

    if (native instanceof Amaz.MeshRenderer) {
      component.initWithNative(entity, native, 'MeshRenderer');
    } else {
      throw new Error('Incorrect argument to ModelComponent::fromNative');
    }

    return component;
  }
  /**
   * @name ModelComponent#castShadow
   * @type {boolean}
   * @description Model's cast shadow flag.
   * @sdk 9.8.0
   */


  get castShadow() {
    return this.native.castShadow;
  }

  set castShadow(value) {
    this.native.castShadow = value;
  }
  /**
   * @name ModelComponent#mesh
   * @type {Mesh}
   * @description Model's mesh.
   * @sdk 9.8.0
   */


  get mesh() {
    return this.native.mesh;
  }

  set mesh(value) {
    this.native.mesh = value;
  }
  /**
   * @name ModelComponent#material
   * @type {Material}
   * @description Model's material.
   * @sdk 9.8.0
   */


  get material() {
    if (!this._material) {
      const nativeMaterial = this.native.material;

      if (nativeMaterial) {
        this._material = new Material(nativeMaterial);
      }
    }

    return this._material;
  }

  set material(value) {
    if (value) {
      this._material = value;
      this.native.material = value.native;
    }
  }

}

const DEG2RAD = Math.PI / 180.0;

/**
 * @class
 * @category Math
 * @name Quat
 * @classdesc Class for math quaternion.
 * @description Constructor to create an Quat instance.
 * @param {number} x - x.
 * @param {number} y - y.
 * @param {number} x - z.
 * @param {number} y - w.
 * @sdk 9.8.0
 */

var Quat = Amaz.Quaternionf;
/**
 * @function
 * @name Quat#clone
 * @description Clone target quaternion.
 * @returns {Quat} A clone of the target quaternion.
 * @sdk 9.8.0
 */

Quat.prototype.clone = function () {
  return this.copy();
};
/**
 * @function
 * @name Quat#eulerAngles
 * @description Convert from euler angles to quaternion.
 * @param {number} x - x angle.
 * @param {number} y - y angle.
 * @param {number} z - z angle.
 * @returns {Quat} Result of the conversion.
 * @sdk 9.8.0
 */


Quat.prototype.eulerAngles = function (x, y, z) {
  const ret = this.eulerToQuaternion(new Vec3(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD));
  this.set(ret.x, ret.y, ret.z, ret.w);
  return this;
};
/**
 * @function
 * @name Quat#toAxisAngle
 * @description Convert quaternion to [axis, angle].
 * @returns {object[]} Result of the conversion [Vec3, number].
 * @sdk 9.8.0
 */


Quat.prototype.toAxisAngle = function () {
  const targetAxis = new Vec3();
  const angle = 2 * Math.acos(this.w);
  const s = Math.sqrt(1 - this.w * this.w);

  if (s < 0.001) {
    targetAxis.x = this.x;
    targetAxis.y = this.y;
    targetAxis.z = this.z;
  } else {
    targetAxis.x = this.x / s;
    targetAxis.y = this.y / s;
    targetAxis.z = this.z / s;
  }

  return [targetAxis, angle];
};
/**
 * @function
 * @name Quat#fromToRotation
 * @description Calculate the quaternion to rotate from one vector to another.
 * @param {Vec3} from - from vector.
 * @param {Vec3} to - to vector.
 * @returns {Quat} The quaternion for rotation.
 * @sdk 9.8.0
 */


Quat.prototype.fromToRotation = function (from, to) {
  const ret = Quat.fromToQuaternionSafe(from, to);
  this.set(ret.x, ret.y, ret.z, ret.w);
  return this;
};

const properties = ['autoPlay', 'flipDirection', 'totalParticles', 'material', 'emitterRadius', 'emissionRate', 'lifetime', 'scale', 'angle', 'speed', 'rotationX', 'rotationY', 'rotationZ', 'rotationXSpeed', 'rotationYSpeed', 'rotationZSpeed', 'colors', 'orientation', 'sortingMode', 'renderType', 'mesh', 'displayMode', 'orientationStart', 'orientationEnd', 'affectorType', 'colorAffectorOperation', 'colorAffectorColors'];
/**
 * @class
 * @category Component
 * @name ParticleSystemComponent
 * @augments Component
 * @classdesc ParticleSystemComponent class for particle system simulation.
 * @description Constructor to create an ParticleSystemComponent instance.
 * To add an ParticleSystemComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create ParticleSystemComponent.
 * @param {amg.ParticleSystemAffector} options.affectorType - Options to add affector.
 * @example
 * // add ParticleSystemComponent to entity
 * entity.addComponent('ParticleSystem', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class ParticleSystemComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'ParticleComponent');
      let renderType;

      if (options && options.hasOwnProperty('renderType')) {
        renderType = options['renderType'];
      } else {
        renderType = exports.ParticleSystemRenderType.Quad;
      }

      if (renderType == exports.ParticleSystemRenderType.Mesh) {
        this.native.renderer = new Amaz.ParticleMeshRenderer();
      } else if (renderType == exports.ParticleSystemRenderType.Quad) {
        this.native.renderer = new Amaz.ParticleQuatRenderer();
      } else {
        throw new Error('Incorrect options: renderType');
      }

      let affectorType;

      if (options && options.hasOwnProperty('affectorType')) {
        affectorType = options['affectorType'];
      }

      if (affectorType == exports.ParticleSystemAffector.Color) {
        const affectors = new Amaz.Vector();
        affectors.pushBack(new Amaz.ColorAffector());
        this.native.affectors = affectors;
      }

      const emitters = new Amaz.Vector();
      emitters.pushBack(new Amaz.CircleEmitter());
      this.native.emitters = emitters;
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new ParticleSystemComponent();

    if (native instanceof Amaz.ParticleComponent) {
      component.initWithNative(entity, native, 'ParticleComponent');
    } else {
      throw new Error('Incorrect argument to ParticleSystemComponent::fromNative');
    }

    return component;
  }

  getEmitter() {
    const emitter = this.native.emitters.get(0);

    if (emitter instanceof Amaz.CircleEmitter) {
      return emitter;
    } else {
      return undefined;
    }
  }

  getAffector() {
    const affector = this.native.affectors.get(0);

    if (affector instanceof Amaz.ColorAffector) {
      return affector;
    } else {
      return undefined;
    }
  }

  getProps() {
    return properties;
  }
  /**
   * @function
   * @name ParticleSystemComponent#isPlaying
   * @description Check if particle system's playing.
   * @sdk 9.8.0
   */


  isPlaying() {
    return this.native.isStarted();
  }
  /**
   * @function
   * @name ParticleSystemComponent#start
   * @description Start particle system.
   * @sdk 9.8.0
   */


  start() {
    const emitter = this.getEmitter();

    if (emitter) {
      emitter.enable = true;
    }

    return this.native.start();
  }
  /**
   * @function
   * @name ParticleSystemComponent#stop
   * @description Stop particle system.
   * @sdk 9.8.0
   */


  stop() {
    return this.native.stop();
  }
  /**
   * @function
   * @name ParticleSystemComponent#resume
   * @description Resume particle system.
   * @sdk 9.8.0
   */


  resume() {
    return this.native.resume();
  }
  /**
   * @function
   * @name ParticleSystemComponent#pause
   * @description Pause particle system.
   * @sdk 9.8.0
   */


  pause() {
    return this.native.pause();
  }
  /**
   * @name ParticleSystemComponent#orientation
   * @type {amg.ParticleSystemRenderOrientation}
   * @description Particle system's orientation type.
   * @sdk 9.8.0
   */


  get orientation() {
    if (this.native.renderer instanceof Amaz.ParticleQuatRenderer) {
      return this.native.renderer.orientationType;
    } else {
      throw new Error('Not supported param for render type');
    }
  }

  set orientation(value) {
    if (this.native.renderer instanceof Amaz.ParticleQuatRenderer) {
      this.native.renderer.orientationType = value;
    } else {
      throw new Error('Not supported param for render type');
    }
  }
  /**
   * @name ParticleSystemComponent#sortingMode
   * @type {amg.ParticleSystemRenderSortingMode}
   * @description Particle system's sorting mode.
   * @sdk 9.8.0
   */


  get sortingMode() {
    return this.native.renderer.sortingMode;
  }

  set sortingMode(value) {
    this.native.renderer.sortingMode = value;
  }
  /**
   * @name ParticleSystemComponent#displayMode
   * @type {amg.ParticleSystemRenderDisplayMode}
   * @description Particle system's display mode.
   * @sdk 9.8.0
   */


  get displayMode() {
    if (this.native.renderer instanceof Amaz.ParticleMeshRenderer) {
      return this.native.renderer.displayMode;
    } else {
      throw new Error('Not supported param for render type');
    }
  }

  set displayMode(value) {
    if (this.native.renderer instanceof Amaz.ParticleMeshRenderer) {
      this.native.renderer.displayMode = value;
    } else {
      throw new Error('Not supported param for render type');
    }
  }
  /**
   * @name ParticleSystemComponent#mesh
   * @type {Mesh}
   * @description Particle system's mesh.
   * @sdk 9.8.0
   */


  get mesh() {
    return this.native.renderer.templateMesh;
  }

  set mesh(value) {
    this.native.renderer.templateMesh = value;
  }
  /**
   * @name ParticleSystemComponent#autoPlay
   * @type {boolean}
   * @description Particle system's auto play flag.
   * @sdk 9.8.0
   */


  get autoPlay() {
    return this.native.autoStart;
  }

  set autoPlay(value) {
    this.native.autoStart = value;
  }
  /**
   * @name ParticleSystemComponent#flipDirection
   * @type {boolean}
   * @description Particle system's flip direction flag.
   * @sdk 9.8.0
   */


  get flipDirection() {
    return this.native.flipY;
  }

  set flipDirection(value) {
    this.native.flipY = value;
  }
  /**
   * @name ParticleSystemComponent#totalParticles
   * @type {number}
   * @description Particle system's total particles.
   * @sdk 9.8.0
   */


  get totalParticles() {
    return this.native.particleQuota;
  }

  set totalParticles(value) {
    this.native.particleQuota = value;
  }
  /**
   * @name ParticleSystemComponent#material
   * @type {Material | undefined}
   * @description Particle system's material.
   * @sdk 9.8.0
   */


  get material() {
    if (!this._material) {
      const nativeMaterial = this.native.material;

      if (nativeMaterial) {
        this._material = new Material(nativeMaterial);
      }
    }

    return this._material;
  }

  set material(value) {
    if (value) {
      this._material = value;
      this.native.material = value.native;
    }
  }
  /**
   * @name ParticleSystemComponent#emitterRadius
   * @type {object}
   * @description Particle system's emitter radius.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get emitterRadius() {
    const emitter = this.getEmitter();

    if (emitter) {
      return {
        min: emitter.inner_radius,
        max: emitter.radius
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get emitterRadius');
    }
  }

  set emitterRadius(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      emitter.innder_radius = param.min;
      emitter.radius = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set emitterRadius');
    }
  }
  /**
   * @name ParticleSystemComponent#emissionRate
   * @type {object}
   * @description Particle emitter's emission rate.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get emissionRate() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.emissionRate;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get emissionRate');
    }
  }

  set emissionRate(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.emissionRate;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set emissionRate');
    }
  }
  /**
   * @name ParticleSystemComponent#lifetime
   * @type {object}
   * @description Particle's life time.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get lifetime() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.totalTimeToLive;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get lifetime');
    }
  }

  set lifetime(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.totalTimeToLive;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set lifetime');
    }
  }
  /**
   * @name ParticleSystemComponent#scale
   * @type {object}
   * @description Particle's scale.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get scale() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleScale;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get scale');
    }
  }

  set scale(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleScale;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set scale');
    }
  }
  /**
   * @name ParticleSystemComponent#angle
   * @type {object}
   * @description Particle's angle.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get angle() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.angle;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get angle');
    }
  }

  set angle(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.angle;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set angle');
    }
  }
  /**
   * @name ParticleSystemComponent#speed
   * @type {object}
   * @description Particle's speed.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get speed() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleVelocity;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get speed');
    }
  }

  set speed(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleVelocity;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set speed');
    }
  }
  /**
   * @name ParticleSystemComponent#rotationX
   * @type {object}
   * @description Particle's rotation around X axis.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get rotationX() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleXRotation;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get rotationX');
    }
  }

  set rotationX(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleXRotation;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set rotationX');
    }
  }
  /**
   * @name ParticleSystemComponent#rotationY
   * @type {object}
   * @description Particle's rotation around Y axis.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get rotationY() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleYRotation;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get rotationY');
    }
  }

  set rotationY(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleYRotation;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set rotationY');
    }
  }
  /**
   * @name ParticleSystemComponent#rotationZ
   * @type {object}
   * @description Particle's rotation around Z axis.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get rotationZ() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleZRotation;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get rotationZ');
    }
  }

  set rotationZ(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleZRotation;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set rotationZ');
    }
  }
  /**
   * @name ParticleSystemComponent#rotationXSpeed
   * @type {object}
   * @description Particle's rotation speed around X axis.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get rotationXSpeed() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleXRotationSpeed;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get rotationXSpeed');
    }
  }

  set rotationXSpeed(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleXRotationSpeed;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set rotationXSpeed');
    }
  }
  /**
   * @name ParticleSystemComponent#rotationYSpeed
   * @type {object}
   * @description Particle's rotation speed around Y axis.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get rotationYSpeed() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleYRotationSpeed;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get rotationYSpeed');
    }
  }

  set rotationYSpeed(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleYRotationSpeed;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set rotationYSpeed');
    }
  }
  /**
   * @name ParticleSystemComponent#rotationZSpeed
   * @type {object}
   * @description Particle's rotation speed around Z axis.
   * <table>
   *  <tr><td>min</td><td>number</td></tr>
   *  <tr><td>max</td><td>number</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get rotationZSpeed() {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleZRotationSpeed;
      return {
        min: value.min,
        max: value.max
      };
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get rotationZSpeed');
    }
  }

  set rotationZSpeed(param) {
    const emitter = this.getEmitter();

    if (emitter) {
      const value = emitter.particleZRotationSpeed;
      value.min = param.min;
      value.max = param.max;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set rotationZSpeed');
    }
  }
  /**
   * @name ParticleSystemComponent#colors
   * @type {Array<Amaz.Color>}
   * @description Particle's random color list.
   * @sdk 9.8.0
   */


  set colors(inColors) {
    const emitter = this.getEmitter();

    if (emitter) {
      const particleColors = new Amaz.Vec4Vector();

      for (const color of inColors) {
        particleColors.pushBack(new Vec4(color.r, color.g, color.b, color.a));
      }

      emitter.particleColorList = particleColors;
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set colors');
    }
  }
  /**
   * @name ParticleSystemComponent#orientationStart
   * @type {Vec3}
   * @description Particle's orientation start angles.
   * @sdk 9.8.0
   */


  get orientationStart() {
    const emitter = this.getEmitter();

    if (emitter) {
      return emitter.orientationStart.quaternionToEuler();
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get orientationStart');
    }
  }

  set orientationStart(value) {
    const emitter = this.getEmitter();

    if (emitter) {
      emitter.orientationStart = new Quat().eulerAngles(value.x, value.y, value.z);
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set orientationStart');
    }
  }
  /**
   * @name ParticleSystemComponent#orientationEnd
   * @type {Vec3}
   * @description Particle's orientation end angles.
   * @sdk 9.8.0
   */


  get orientationEnd() {
    const emitter = this.getEmitter();

    if (emitter) {
      return emitter.orientationEnd.quaternionToEuler();
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::get orientationEnd');
    }
  }

  set orientationEnd(value) {
    const emitter = this.getEmitter();

    if (emitter) {
      emitter.orientationEnd = new Quat().eulerAngles(value.x, value.y, value.z);
    } else {
      throw new Error('Invalid emitter in ParticleSystemComponent::set orientationEnd');
    }
  }
  /**
   * @name ParticleSystemComponent#colorAffectorOperation
   * @type {amg.ParticleSystemColorAffectorOperation}
   * @description Particle's color affector's operation.
   * @sdk 9.8.0
   */


  get colorAffectorOperation() {
    const affector = this.getAffector();

    if (affector) {
      return affector.colorOperation;
    } else {
      throw new Error('Invalid affector in ParticleSystemComponent::get colorAffectorOperation');
    }
  }

  set colorAffectorOperation(param) {
    const affector = this.getAffector();

    if (affector) {
      affector.colorOperation = param;
    } else {
      throw new Error('Invalid affector in ParticleSystemComponent::set colorAffectorOperation');
    }
  }
  /**
   * @name ParticleSystemComponent#colorAffectorColors
   * @type {Array<object>}
   * @description Particle's color affector's operation.
   * <table>
   *  <tr><td>time</td><td>number</td></tr>
   *  <tr><td>color</td><td>Color</td></tr>
   * </table>
   * @sdk 9.8.0
   */


  get colorAffectorColors() {
    const affector = this.getAffector();

    if (affector) {
      const colors = [];

      for (let i = 0; i < affector.colorMap.size(); ++i) {
        const color = affector.colorMap.get(i);
        colors.push({
          time: color.get(0),
          color: new Amaz.Color(color.get(1), color.get(2), color.get(3), color.get(4))
        });
      }

      return colors;
    } else {
      throw new Error('Invalid affector in ParticleSystemComponent::get colorAffectorColors');
    }
  }

  set colorAffectorColors(timeColors) {
    const affector = this.getAffector();

    if (affector) {
      const colorMap = new Amaz.Vector();

      for (const timeColor of timeColors) {
        const colors = new Amaz.FloatVector();
        colors.pushBack(timeColor.time);
        colors.pushBack(timeColor.color.r);
        colors.pushBack(timeColor.color.g);
        colors.pushBack(timeColor.color.b);
        colors.pushBack(timeColor.color.a);
        colorMap.pushBack(colors);
      }

      affector.colorMap = colorMap;
    } else {
      throw new Error('Invalid affector in ParticleSystemComponent::set colorAffectorColors');
    }
  }

}

const properties$1 = ['type', 'mass', 'category', 'mask'];
const PhysicsCategoryMax = 16;
/**
 * @class
 * @category Component
 * @name Physics3DComponent
 * @augments EventHandler
 * @classdesc Abstract Physics3DComponent class for 3d physics body simulation.
 * @hideconstructor
 * @sdk 9.8.0
 */

class Physics3DComponent extends Component {
  constructor(entity, options) {
    if (entity && options && options.hasOwnProperty('type')) {
      super(entity, 'RigidBody3D');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  initialize(options, props) {
    var _this$entity, _this$entity2;

    super.initialize(options, props);
    this.native.initPosition = (_this$entity = this.entity) == null ? void 0 : _this$entity.position;
    this.native.initRotation = (_this$entity2 = this.entity) == null ? void 0 : _this$entity2.rotationQuat;
    this.moveToLocation(this.native.initPosition, this.native.initRotation);
  }

  moveToLocation(position, rotation) {
    this.native.position = position;
    this.native.rotationQuat = rotation;
  }

  getProps() {
    return properties$1;
  }

  getContactPoints(collision) {
    const contacts = [];

    for (let i = 0; i < collision.contacts.size(); ++i) {
      contacts.push(collision.contacts.get(i));
    }

    return contacts;
  }
  /**
   * @name Physics3DComponent#mass
   * @type {number}
   * @description The physics body's mass.
   * @sdk 9.8.0
   */


  get mass() {
    return this.native.mass;
  }

  set mass(value) {
    this.native.mass = value;
  }

  setSensorEnabled(isEnabled) {
    // trigger is implemented as CF_NO_CONTACT_RESPONSE
    this.native.sensor = isEnabled;
  }
  /**
   * @name Physics3DComponent#type
   * @type {amg.Physics3DType}
   * @description The physics body's type.
   * @sdk 9.8.0
   */


  get type() {
    return this.native.rigidBodyType;
  }

  set type(value) {
    this.native.rigidBodyType = value;
  }
  /**
   * @name Physics3DComponent#category
   * @type {number}
   * @description The physics body's category for interaction masking.
   * @sdk 9.8.0
   */


  get category() {
    return Math.log2(this.native.categoryBits);
  }

  set category(value) {
    this.native.categoryBits = 1 << value;
  }
  /**
   * @name Physics3DComponent#mask
   * @type {number}
   * @description The physics body's interaction masking.
   * @sdk 9.8.0
   */


  get mask() {
    const maskArray = [];
    const maskBits = this.native.maskBits;

    for (let i = 0; i < PhysicsCategoryMax; ++i) {
      if ((1 << i & maskBits) > 0) {
        maskArray.push(i);
      }
    }

    return maskArray;
  }

  set mask(value) {
    let maskBits = 0;

    for (const i of value) {
      if (0 <= i && i < PhysicsCategoryMax) {
        maskBits |= 1 << i;
      } else {
        throw new Error('Invalid mask value!');
      }
    }

    this.native.maskBits = maskBits;
  }

}

const properties$2 = ['angularDamping', 'angularFactor', 'angularVelocity', 'linearDamping', 'linearFactor', 'linearVelocity', 'gravityAcceleration'];
/**
 * @class
 * @category Component
 * @name RigidBody3DComponent
 * @augments Physics3DComponent
 * @classdesc RigidBody3DComponent class 3d rigid body simulation.
 * @description Constructor to create an RigidBody3DComponent instance.
 * To add an RigidBody3DComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create RigidBody3DComponent.
 * @example
 * // add RigidBody3DComponent to entity
 * entity.addComponent('RigidBody3D', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

/**
 * @event
 * @name RigidBody3DComponent#triggerenter
 * @description Fired after rigid body entered trigger.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.rigidBody.on('triggerenter', function () {
 *     console.log('Entity entered');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name RigidBody3DComponent#collisionenter
 * @description Fired after rigid body entered collision with other rigid body.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.rigidBody.on('collisionenter', function () {
 *     console.log('Entity entered');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name RigidBody3DComponent#triggerexit
 * @description Fired after rigid body exited trigger.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.rigidBody.on('triggerexit', function () {
 *     console.log('Entity exited');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name RigidBody3DComponent#collisionexit
 * @description Fired after rigid body exited collision with other rigid body.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.rigidBody.on('collisionexit', function () {
 *     console.log('Entity exited');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name RigidBody3DComponent#triggerstay
 * @description Fired while rigid body is staying trigger.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.rigidBody.on('triggerstay', function () {
 *     console.log('Entity exited');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name RigidBody3DComponent#collisionstay
 * @description Fired while rigid body is staying collision with other rigid body.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.rigidBody.on('collisionstay', function () {
 *     console.log('Entity stays');
 * });
 * @sdk 9.8.0
 */

class RigidBody3DComponent extends Physics3DComponent {
  constructor(entity, options) {
    if (entity && options && options.hasOwnProperty('type')) {
      super(entity, options);
      this.registerCallbacks();
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new RigidBody3DComponent();

    if (native instanceof Amaz.RigidBody3D && !native.sensor) {
      component.initWithNative(entity, native, 'RigidBody3D');
    } else {
      throw new Error('Incorrect argument to RigidBodyComponent::fromNative');
    }

    component.registerCallbacks();
    return component;
  }

  destroy() {
    this.removeCallbacks();
    super.destroy();
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$2);
  }

  initialize(options, props) {
    super.initialize(options, props);
    this.reset();
  }

  reset() {
    const zero = new Vec3(0, 0, 0);
    this.native.initLinearVel = zero;
    this.native.initAngularVel = zero;
    this.native.externalForce = zero;
    this.native.forcePosition = zero;
    this.native.externalTorque = zero;
    this.native.externalImpulse = zero;
    this.native.impulsePosition = zero;
    this.native.externalTorqueImpulse = zero;
    this.linearVelocity = zero;
    this.angularVelocity = zero;
    this.gravityAcceleration = new Vec3(0, -9.81, 0);
  }
  /**
   * @function
   * @name RigidBody3DComponent#teleport
   * @description Move rigid body to new position and rotation.
   * @param {Vec3} position - Local position to move.
   * @param {Vec3} eulerAngles - Local euler angles to move.
   * @sdk 9.8.0
   */


  teleport(position, eulerAngles) {
    const rotation = new Quat();

    if (eulerAngles) {
      rotation.eulerAngles(eulerAngles.x, eulerAngles.y, eulerAngles.z);
    }

    this.moveToLocation(position, rotation);
    this.reset();
  }
  /**
   * @function
   * @name RigidBody3DComponent#applyForce
   * @description Apply force to rigid body at position.
   * @param {Vec3} force - Local force to apply.
   * @param {Vec3} position - Local position of the force.
   * @sdk 9.8.0
   */


  applyForce(force, position) {
    this.native.externalForce = force;
    this.native.forcePosition = position ? position : new Vec3(0, 0, 0);
  }
  /**
   * @function
   * @name RigidBody3DComponent#applyTorque
   * @description Apply torque to rigid body.
   * @param {Vec3} torque - Local torque to apply.
   * @sdk 9.8.0
   */


  applyTorque(torque) {
    this.native.externalTorque = torque;
  }
  /**
   * @function
   * @name RigidBody3DComponent#applyImpusle
   * @description Apply impulse to rigid body.
   * @param {Vec3} impulse - Local impulse to apply.
   * @param {Vec3} position - Local position to apply.
   * @sdk 9.8.0
   */


  applyImpusle(impulse, position) {
    this.native.externalImpulse = impulse;
    this.native.impulsePosition = position ? position : new Vec3(0, 0, 0);
  }
  /**
   * @function
   * @name RigidBody3DComponent#applyTorqueImpulse
   * @description Apply torque impulse to rigid body.
   * @param {Vec3} torqueImpulse - Local torque impulse to apply.
   * @sdk 9.8.0
   */


  applyTorqueImpulse(torqueImpulse) {
    this.native.externalTorqueImpulse = torqueImpulse;
  }
  /**
   * @name RigidBody3DComponent#angularDamping
   * @type {number}
   * @description Rigid body's angular damping.
   * @sdk 9.8.0
   */


  get angularDamping() {
    return this.native.angularDamping;
  }

  set angularDamping(value) {
    this.native.angularDamping = value;
  }
  /**
   * @name RigidBody3DComponent#angularFactor
   * @type {Vec3}
   * @description Rigid body's angular factor.
   * @sdk 9.8.0
   */


  get angularFactor() {
    return this.native.angularFactor;
  }

  set angularFactor(value) {
    this.native.angularFactor = value;
  }
  /**
   * @name RigidBody3DComponent#angularVelocity
   * @type {Vec3}
   * @description Rigid body's angular velocity.
   * @sdk 9.8.0
   */


  get angularVelocity() {
    return this.native.angularVel;
  }

  set angularVelocity(value) {
    this.native.angularVel = value;
  }
  /**
   * @name RigidBody3DComponent#linearDamping
   * @type {number}
   * @description Rigid body's linear damping.
   * @sdk 9.8.0
   */


  get linearDamping() {
    return this.native.linearDamping;
  }

  set linearDamping(value) {
    this.native.linearDamping = value;
  }
  /**
   * @name RigidBody3DComponent#linearFactor
   * @type {Vec3}
   * @description Rigid body's linear factor.
   * @sdk 9.8.0
   */


  get linearFactor() {
    return this.native.linearFactor;
  }

  set linearFactor(value) {
    this.native.linearFactor = value;
  }
  /**
   * @name RigidBody3DComponent#linearVelocity
   * @type {Vec3}
   * @description Rigid body's linear velocity.
   * @sdk 9.8.0
   */


  get linearVelocity() {
    return this.native.linearVel;
  }

  set linearVelocity(value) {
    this.native.linearVel = value;
  }
  /**
   * @name RigidBody3DComponent#gravity
   * @type {Vec3}
   * @description Rigid body's gravity acceleration.
   * @sdk 9.8.0
   */


  get gravityAcceleration() {
    return this.native.gravityAcceleration;
  }

  set gravityAcceleration(value) {
    this.native.gravityAcceleration = value;
  }

  registerCallbacks() {
    this.addListener(Amaz.Collision3DEventType.ENTER, this.onCollisionEnter, this);
    this.addListener(Amaz.Collision3DEventType.STAY, this.onCollisionStay, this);
    this.addListener(Amaz.Collision3DEventType.EXIT, this.onCollisionExit, this);
  }

  removeCallbacks() {
    this.removeListener(Amaz.Collision3DEventType.ENTER, this.onCollisionEnter);
    this.removeListener(Amaz.Collision3DEventType.STAY, this.onCollisionStay);
    this.removeListener(Amaz.Collision3DEventType.EXIT, this.onCollisionExit);
  }

  onCollisionEnter(thisBody, collision) {
    var _thisBody$entity, _thisBody$entity$scen;

    const otherNativeEntity = collision.otherRigidbody.entity;
    const otherEntity = (_thisBody$entity = thisBody.entity) == null ? void 0 : (_thisBody$entity$scen = _thisBody$entity.scene) == null ? void 0 : _thisBody$entity$scen.entityFromNative(otherNativeEntity);
    const contacts = thisBody.getContactPoints(collision);

    if (collision.otherRigidbody.sensor) {
      thisBody.fire('triggerenter', thisBody.entity, otherEntity, contacts);
    } else {
      thisBody.fire('collisionenter', thisBody.entity, otherEntity, contacts);
    }
  }

  onCollisionStay(thisBody, collision) {
    var _thisBody$entity2, _thisBody$entity2$sce;

    const otherNativeEntity = collision.otherRigidbody.entity;
    const otherEntity = (_thisBody$entity2 = thisBody.entity) == null ? void 0 : (_thisBody$entity2$sce = _thisBody$entity2.scene) == null ? void 0 : _thisBody$entity2$sce.entityFromNative(otherNativeEntity);
    const contacts = thisBody.getContactPoints(collision);

    if (collision.otherRigidbody.sensor) {
      thisBody.fire('triggerstay', thisBody.entity, otherEntity, contacts);
    } else {
      thisBody.fire('collisionstay', thisBody.entity, otherEntity, contacts);
    }
  }

  onCollisionExit(thisBody, collision) {
    var _thisBody$entity3, _thisBody$entity3$sce;

    const otherNativeEntity = collision.otherRigidbody.entity;
    const otherEntity = (_thisBody$entity3 = thisBody.entity) == null ? void 0 : (_thisBody$entity3$sce = _thisBody$entity3.scene) == null ? void 0 : _thisBody$entity3$sce.entityFromNative(otherNativeEntity);
    const contacts = thisBody.getContactPoints(collision);

    if (collision.otherRigidbody.sensor) {
      thisBody.fire('triggerexit', thisBody.entity, otherEntity, contacts);
    } else {
      thisBody.fire('collisionexit', thisBody.entity, otherEntity, contacts);
    }
  }

}

const properties$3 = ['alpha', 'alphaCascading'];
/**
 * @class
 * @category Component
 * @name WidgetComponent
 * @augments Component
 * @classdesc Abstract WidgetComponent class for 2d widgets.
 * @hideconstructor
 * @sdk 9.8.0
 */

class WidgetComponent extends Component {
  constructor(entity, nativeClass, options) {
    if (entity && nativeClass) {
      if (entity.screenTransform) {
        super(entity, nativeClass);
        this.initialize(options, this.getProps());
      } else {
        throw new Error('Widget2DComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  getProps() {
    return properties$3;
  }
  /**
   * @name WidgetComponent#alpha
   * @type {number}
   * @description The widget's alpha.
   * @sdk 9.8.0
   */


  get alpha() {
    return this.native.alpha;
  }

  set alpha(value) {
    this.native.alpha = value;
  }
  /**
   * @name WidgetComponent#alphaCascading
   * @type {boolean}
   * @description The widget's alpha cascading flag.
   * @sdk 9.8.0
   */


  get alphaCascading() {
    return this.native.cascadeAlphaEnabled;
  }

  set alphaCascading(value) {
    this.native.cascadeAlphaEnabled = value;
  }

}

const properties$4 = ['renderMode', 'color', 'texture', 'atlas', 'atlasIndex', 'filledType', 'filledStart', 'filledRange', 'slicedLeft', 'slicedRight', 'slicedTop', 'slicedBottom', 'slicedFillCenter', 'ellipseWidth', 'ellipseHeight', 'freeTopLeft', 'freeTopRight', 'freeBottomLeft', 'freeBottomRight', 'cornerTopLeft', 'cornerTopRight', 'cornerBottomLeft', 'cornerBottomRight'];
/**
 * @class
 * @category Component
 * @name ImageComponent
 * @augments WidgetComponent
 * @classdesc ImageComponent class for 2d sprite rendering.
 * @description Constructor to create an ImageComponent instance.
 * To add an ImageComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create ImageComponent.
 * @example
 * // add ImageComponent to entity
 * entity.addComponent('Image', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class ImageComponent extends WidgetComponent {
  constructor(entity, options) {
    super(entity, 'IFSprite2d', options);
  }

  static fromNative(entity, native) {
    const component = new ImageComponent();

    if (native instanceof Amaz.IFSprite2d) {
      component.initWithNative(entity, native, 'IFSprite2d');
    } else {
      throw new Error('Incorrect argument in ImageComponent::fromNative');
    }

    return component;
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$4);
  }
  /**
   * @name ImageComponent#renderMode
   * @type {amg.ImageRenderMode}
   * @description The sprite's render mode.
   * @sdk 9.8.0
   */


  get renderMode() {
    return this.native.type;
  }

  set renderMode(value) {
    this.native.type = value;
  }
  /**
   * @name ImageComponent#color
   * @type {Color}
   * @description The sprite's color tint.
   * @sdk 9.8.0
   */


  get color() {
    return this.native.colorTint;
  }

  set color(value) {
    this.native.colorTint = value;
  }
  /**
   * @name ImageComponent#texture
   * @type {Texture}
   * @description The sprite's texture.
   * @sdk 9.8.0
   */


  get texture() {
    return this.native.texture;
  }

  set texture(value) {
    this.native.texture = value;
  }
  /**
   * @name ImageComponent#atlas
   * @type {ImageAtlas}
   * @description The sprite's image atlas.
   * @sdk 9.8.0
   */


  get atlas() {
    return this.native.imageAtlas;
  }

  set atlas(value) {
    this.native.imageAtlas = value;
  }
  /**
   * @name ImageComponent#atlasIndex
   * @type {number}
   * @description The sprite's atlas index.
   * @sdk 9.8.0
   */


  get atlasIndex() {
    return this.native.atlasIndex;
  }

  set atlasIndex(value) {
    this.native.atlasIndex = value;
  }
  /**
   * @name ImageComponent#filledType
   * @type {amg.ImageFillType}
   * @description The sprite's filled type  (in filled mode).
   * @sdk 9.8.0
   */


  get filledType() {
    return this.native.filledType;
  }

  set filledType(value) {
    this.native.filledType = value;
  }
  /**
   * @name ImageComponent#filledStart
   * @type {number}
   * @description The sprite's filled start (in filled mode).
   * @sdk 9.8.0
   */


  get filledStart() {
    return this.native.filledStartPos;
  }

  set filledStart(value) {
    this.native.filledStartPos = value;
  }
  /**
   * @name ImageComponent#filledRange
   * @type {number}
   * @description The sprite's filled range (in filled mode).
   * @sdk 9.8.0
   */


  get filledRange() {
    return this.native.filledRange;
  }

  set filledRange(value) {
    this.native.filledRange = value;
  }
  /**
   * @name ImageComponent#slicedLeft
   * @type {number}
   * @description The sprite's left slice's size (in sliced mode).
   * @sdk 9.8.0
   */


  get slicedLeft() {
    return this.native.slicedLeft;
  }

  set slicedLeft(value) {
    this.native.slicedLeft = value;
  }
  /**
   * @name ImageComponent#slicedRight
   * @type {number}
   * @description The sprite's right slice's size (in sliced mode).
   * @sdk 9.8.0
   */


  get slicedRight() {
    return this.native.slicedRight;
  }

  set slicedRight(value) {
    this.native.slicedRight = value;
  }
  /**
   * @name ImageComponent#slicedTop
   * @type {number}
   * @description The sprite's top slice's size (in sliced mode).
   * @sdk 9.8.0
   */


  get slicedTop() {
    return this.native.slicedTop;
  }

  set slicedTop(value) {
    this.native.slicedTop = value;
  }
  /**
   * @name ImageComponent#slicedBottom
   * @type {number}
   * @description The sprite's bottom slice's size (in sliced mode).
   * @sdk 9.8.0
   */


  get slicedBottom() {
    return this.native.slicedBottom;
  }

  set slicedBottom(value) {
    this.native.slicedBottom = value;
  }
  /**
   * @name ImageComponent#slicedFillCenter
   * @type {boolean}
   * @description The sprite's fill center flag (in sliced mode).
   * @sdk 9.8.0
   */


  get slicedFillCenter() {
    return this.native.fillCenter;
  }

  set slicedFillCenter(value) {
    this.native.fillCenter = value;
  }
  /**
   * @name ImageComponent#ellipseWidth
   * @type {number}
   * @description The sprite's ellipse's width (in ellipse mode).
   * @sdk 9.8.0
   */


  get ellipseWidth() {
    return this.native.ellipseX;
  }

  set ellipseWidth(value) {
    this.native.ellipseX = value;
  }
  /**
   * @name ImageComponent#ellipseHeight
   * @type {number}
   * @description The sprite's ellipse's height (in ellipse mode).
   * @sdk 9.8.0
   */


  get ellipseHeight() {
    return this.native.ellipseY;
  }

  set ellipseHeight(value) {
    this.native.ellipseY = value;
  }
  /**
   * @name ImageComponent#freeTopLeft
   * @type {Vec2}
   * @description The sprite's top left corner (in free mode).
   * @sdk 9.8.0
   */


  get freeTopLeft() {
    return this.native.topLeftPoint;
  }

  set freeTopLeft(value) {
    this.native.topLeftPoint = value;
  }
  /**
   * @name ImageComponent#freeTopRight
   * @type {Vec2}
   * @description The sprite's top right corner (in free mode).
   * @sdk 9.8.0
   */


  get freeTopRight() {
    return this.native.topRightPoint;
  }

  set freeTopRight(value) {
    this.native.topRightPoint = value;
  }
  /**
   * @name ImageComponent#freeTopRight
   * @type {Vec2}
   * @description The sprite's bottom left corner (in free mode).
   * @sdk 9.8.0
   */


  get freeBottomLeft() {
    return this.native.bottomLeftPoint;
  }

  set freeBottomLeft(value) {
    this.native.bottomLeftPoint = value;
  }
  /**
   * @name ImageComponent#freeTopRight
   * @type {Vec2}
   * @description The sprite's bottom right corner (in free mode).
   * @sdk 9.8.0
   */


  get freeBottomRight() {
    return this.native.bottomRightPoint;
  }

  set freeBottomRight(value) {
    this.native.bottomRightPoint = value;
  }
  /**
   * @name ImageComponent#cornerTopLeft
   * @type {Vec2}
   * @description The sprite's top left corner (in corner mode).
   * @sdk 9.8.0
   */


  get cornerTopLeft() {
    return this.native.topLeft;
  }

  set cornerTopLeft(value) {
    this.native.topLeft = value;
  }
  /**
   * @name ImageComponent#cornerTopRight
   * @type {Vec2}
   * @description The sprite's top right corner (in corner mode).
   * @sdk 9.8.0
   */


  get cornerTopRight() {
    return this.native.topRight;
  }

  set cornerTopRight(value) {
    this.native.topRight = value;
  }
  /**
   * @name ImageComponent#cornerBottomLeft
   * @type {Vec2}
   * @description The sprite's bottom left corner (in corner mode).
   * @sdk 9.8.0
   */


  get cornerBottomLeft() {
    return this.native.bottomLeft;
  }

  set cornerBottomLeft(value) {
    this.native.bottomLeft = value;
  }
  /**
   * @name ImageComponent#cornerBottomRight
   * @type {Vec2}
   * @description The sprite's bottom right corner (in corner mode).
   * @sdk 9.8.0
   */


  get cornerBottomRight() {
    return this.native.bottomRight;
  }

  set cornerBottomRight(value) {
    this.native.bottomRight = value;
  }

}

const properties$5 = ['blendMode', 'alpha', 'alphaBlending', 'mask', 'clipping'];
/**
 * @class
 * @category Component
 * @name CanvasComponent
 * @augments Component
 * @classdesc CanvasComponent class for 2d rendering.
 * @description Constructor to create an CanvasComponent instance.
 * To add an CanvasComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create CanvasComponent.
 * @example
 * // add CanvasComponent to entity
 * entity.addComponent('Canvas', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class CanvasComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      if (entity.screenTransform) {
        // call super constructor
        super(entity, 'IFLayer2d'); // create options if there is no options

        if (!options) {
          options = {};
        }

        if (options && !options.hasOwnProperty('alphaBlending')) {
          // turn on alphaBlending by default for render mode to work correctly
          options['alphaBlending'] = true;
        } // initialize all options


        this.initialize(options, this.getProps());
      } else {
        throw new Error('CanvasComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new CanvasComponent();

    if (native instanceof Amaz.IFLayer2d) {
      component.initWithNative(entity, native, 'IFLayer2d');
    } else {
      throw new Error('Incorrect argument to CanvasComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$5;
  }
  /**
   * @name CanvasComponent#blendMode
   * @type {amg.CanvasBlendMode}
   * @description The canvas's blending mode.
   * @sdk 9.8.0
   */


  get blendMode() {
    return this.native.blendMode;
  }

  set blendMode(value) {
    this.native.blendMode = value;
  }
  /**
   * @name CanvasComponent#maskType
   * @type {amg.CanvasMaskType}
   * @description The canvas's mask type.
   * @sdk 9.8.0
   */


  get maskType() {
    return this.native.maskType;
  }

  set maskType(value) {
    this.native.maskType = value;
  }
  /**
   * @name CanvasComponent#renderOrder
   * @type {amg.CanvasRenderOrder}
   * @description The canvas's render order.
   * @sdk 9.8.0
   */


  get renderOrder() {
    return this.native.renderOrderMode;
  }

  set renderOrder(value) {
    this.native.renderOrderMode = value;
  }
  /**
   * @name CanvasComponent#alpha
   * @type {number}
   * @description The canvas's alpha.
   * @sdk 9.8.0
   */


  get alpha() {
    return this.native.blendAlpha;
  }

  set alpha(value) {
    this.native.blendAlpha = value;
  }
  /**
   * @name CanvasComponent#clipping
   * @type {boolean}
   * @description The canvas's clipping flag.
   * @sdk 9.8.0
   */


  get clipping() {
    return this.native.scissorRectMask;
  }

  set clipping(value) {
    this.native.scissorRectMask = value;
  }
  /**
   * @name CanvasComponent#alphaBlending
   * @type {boolean}
   * @description The canvas's alpha blending flag.
   * @sdk 9.8.0
   */


  get alphaBlending() {
    return this.native.blendAlphaCkeck;
  }

  set alphaBlending(value) {
    this.native.blendAlphaCkeck = value;
  }
  /**
   * @function
   * @name CanvasComponent#getDrawCallCount
   * @description Find child entity by name.
   * @returns {number} Number of draw calls.
   * @sdk 9.8.0
   */


  getDrawCallCount() {
    return this.native.drawCallNum;
  }

}

const properties$6 = ['renderMode', 'pivot', 'flipX', 'flipY ', 'material', 'color'];
/**
 * @class
 * @category Component
 * @name SpriteComponent
 * @augments Component
 * @classdesc SpriteComponent class for rendering sprite in 3d space.
 * @description Constructor to create an SpriteComponent instance.
 * To add an SpriteComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create SpriteComponent.
 * @example
 * // add SpriteComponent to entity
 * entity.addComponent('Sprite', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class SpriteComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'Sprite2DRenderer');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new SpriteComponent();

    if (native instanceof Amaz.Sprite2DRenderer) {
      component.initWithNative(entity, native, 'Sprite2DRenderer');
    } else {
      throw new Error('Incorrect argument in SpriteComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$6;
  }
  /**
   * @name SpriteComponent#material
   * @type {Material}
   * @description Sprite's material.
   * @sdk 9.8.0
   */


  get material() {
    if (!this._material) {
      const nativeMaterial = this.native.material;

      if (nativeMaterial) {
        this._material = new Material(nativeMaterial);
      }
    }

    return this._material;
  }

  set material(value) {
    if (value) {
      this._material = value;
      this.native.material = value.native;
    }
  }
  /**
   * @name SpriteComponent#flipX
   * @type {boolean}
   * @description Sprite's flip x flag.
   * @sdk 9.8.0
   */


  get flipX() {
    return this.native.mirror;
  }

  set flipX(value) {
    this.native.mirror = value;
  }
  /**
   * @name SpriteComponent#flipY
   * @type {boolean}
   * @description Sprite's flip y flag.
   * @sdk 9.8.0
   */


  get flipY() {
    return this.native.flip;
  }

  set flipY(value) {
    this.native.flip = value;
  }
  /**
   * @name SpriteComponent#color
   * @type {Color}
   * @description Sprite's color tint.
   * @sdk 9.8.0
   */


  get color() {
    return this.native.color;
  }

  set color(value) {
    this.native.color = value;
  }
  /**
   * @name SpriteComponent#pivot
   * @type {Vec2}
   * @description Sprite's pivot.
   * @sdk 9.8.0
   */


  get pivot() {
    return this.native.pivot;
  }

  set pivot(value) {
    this.native.pivot = value;
  }
  /**
   * @name SpriteComponent#renderMode
   * @type {amg.SpriteRenderMode}
   * @description Sprite's render mode.
   * @sdk 9.8.0
   */


  get renderMode() {
    return this.native.stretchMode;
  }

  set renderMode(value) {
    this.native.stretchMode = value;
  }

}

const properties$7 = ['sequence', 'textureName', 'autoPlay', 'playMode'];
/**
 * @class
 * @category Component
 * @name SeqAnimationComponent
 * @augments Component
 * @classdesc SeqAnimationComponent class for playing sequential image based animation.
 * @description Constructor to create an SeqAnimationComponent instance.
 * To add an SeqAnimationComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create SeqAnimationComponent.
 * @example
 * // add SeqAnimationComponent to entity
 * entity.addComponent('SeqAnimation', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class SeqAnimationComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'AnimSeqComponent');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new SeqAnimationComponent();

    if (native instanceof Amaz.AnimSeqComponent) {
      component.initWithNative(entity, native, 'AnimSeqComponent');
    } else {
      throw new Error('Incorrect argument in SeqAnimationComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$7;
  }
  /**
   * @function
   * @name SeqAnimationComponent#play
   * @description Play animation.
   * @sdk 9.8.0
   */


  play() {
    this.native.play();
  }
  /**
   * @function
   * @name SeqAnimationComponent#stop
   * @description Stop animation.
   * @sdk 9.8.0
   */


  stop() {
    this.native.stop();
  }
  /**
   * @function
   * @name SeqAnimationComponent#pause
   * @description Pause animation.
   * @sdk 9.8.0
   */


  pause() {
    this.native.pause();
  }
  /**
   * @function
   * @name SeqAnimationComponent#resume
   * @description Resume animation.
   * @sdk 9.8.0
   */


  resume() {
    this.native.play();
  }
  /**
   * @function
   * @name SeqAnimationComponent#seek
   * @description Seek animation.
   * @param {number} frameIndex - Seek to a frame index.
   * @sdk 9.8.0
   */


  seek(frameIndex) {
    this.native.seek(frameIndex);
  }
  /**
   * @name SeqAnimationComponent#sequence
   * @type {SeqAnimation}
   * @description The sequential animation.
   * @sdk 9.8.0
   */


  get sequence() {
    return this.native.animSeq;
  }

  set sequence(value) {
    this.native.animSeq = value;
  }
  /**
   * @name SeqAnimationComponent#textureName
   * @type {string}
   * @description The animation's texture name.
   * @sdk 9.8.0
   */


  get textureName() {
    return this.native.texName;
  }

  set textureName(value) {
    this.native.texName = value;
  }
  /**
   * @name SeqAnimationComponent#autoPlay
   * @type {boolean}
   * @description The animation's auto play flag.
   * @sdk 9.8.0
   */


  get autoPlay() {
    return this.native.autoplay;
  }

  set autoPlay(value) {
    this.native.autoplay = value;
  }
  /**
   * @name SeqAnimationComponent#playMode
   * @type {amg.SeqAnimationPlayMode}
   * @description The animation's play mode.
   * @sdk 9.8.0
   */


  get playMode() {
    return this.native.playmode;
  }

  set playMode(value) {
    this.native.playmode = value;
  }

}

/**
 * @class
 * @category Component
 * @name Trigger3DComponent
 * @augments Physics3DComponent
 * @classdesc Trigger3DComponent class for 3d physics trigger.
 * @description Constructor to create an Trigger3DComponent instance.
 * To add an Trigger3DComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create Trigger3DComponent.
 * @example
 * // add Trigger3DComponent to entity
 * entity.addComponent('Trigger3D', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

/**
 * @event
 * @name Trigger3DComponent#triggerstay
 * @description Fired while rigid body is staying in trigger.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.trigger.on('triggerstay', function () {
 *     console.log('Entity stays');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name Trigger3DComponent#triggerexit
 * @description Fired after rigid body exited trigger.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.trigger.on('triggerexit', function () {
 *     console.log('Entity exited');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name Trigger3DComponent#triggerenter
 * @description Fired after rigid body entered trigger.
 * @param {Entity} thisEntity - The entity triggers this event.
 * @param {Entity} otherEntity - The other entity hit by this entity.
 * @param {Array<ContactPoint3D>} contacts - A list of 3d contact points.
 * @example
 * entity.trigger.on('triggerenter', function () {
 *     console.log('Entity entered');
 * });
 * @sdk 9.8.0
 */

class Trigger3DComponent extends Physics3DComponent {
  constructor(entity, triggerOptions) {
    if (entity) {
      const options = {
        type: exports.Physics3DType.Kinematic,
        mass: 1
      };

      if (triggerOptions) {
        options.category = triggerOptions.category;
        options.mask = triggerOptions.mask;
      }

      super(entity, options);
      this.setSensorEnabled(true);
      this.registerCallbacks();
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new Trigger3DComponent();

    if (native instanceof Amaz.RigidBody3D && native.sensor) {
      component.initWithNative(entity, native, 'RigidBody3D');
    } else {
      throw new Error('Incorrect argument to TriggerComponent::fromNative');
    }

    component.registerCallbacks();
    return component;
  }

  destroy() {
    this.removeCallbacks();
    super.destroy();
  }

  registerCallbacks() {
    this.addListener(Amaz.Collision3DEventType.ENTER, this.onTriggerEnter, this);
    this.addListener(Amaz.Collision3DEventType.STAY, this.onTriggerStay, this);
    this.addListener(Amaz.Collision3DEventType.EXIT, this.onTriggerExit, this);
  }

  removeCallbacks() {
    this.removeListener(Amaz.Collision3DEventType.ENTER, this.onTriggerEnter);
    this.removeListener(Amaz.Collision3DEventType.STAY, this.onTriggerStay);
    this.removeListener(Amaz.Collision3DEventType.EXIT, this.onTriggerExit);
  }

  onTriggerEnter(thisBody, collision) {
    var _thisBody$entity, _thisBody$entity$scen;

    const otherNativeEntity = collision.otherRigidbody.entity;
    const otherEntity = (_thisBody$entity = thisBody.entity) == null ? void 0 : (_thisBody$entity$scen = _thisBody$entity.scene) == null ? void 0 : _thisBody$entity$scen.entityFromNative(otherNativeEntity);
    const contacts = thisBody.getContactPoints(collision);
    thisBody.fire('triggerenter', thisBody.entity, otherEntity, contacts);
  }

  onTriggerStay(thisBody, collision) {
    var _thisBody$entity2, _thisBody$entity2$sce;

    const otherNativeEntity = collision.otherRigidbody.entity;
    const otherEntity = (_thisBody$entity2 = thisBody.entity) == null ? void 0 : (_thisBody$entity2$sce = _thisBody$entity2.scene) == null ? void 0 : _thisBody$entity2$sce.entityFromNative(otherNativeEntity);
    const contacts = thisBody.getContactPoints(collision);
    thisBody.fire('triggerstay', thisBody.entity, otherEntity, contacts);
  }

  onTriggerExit(thisBody, collision) {
    var _thisBody$entity3, _thisBody$entity3$sce;

    const otherNativeEntity = collision.otherRigidbody.entity;
    const otherEntity = (_thisBody$entity3 = thisBody.entity) == null ? void 0 : (_thisBody$entity3$sce = _thisBody$entity3.scene) == null ? void 0 : _thisBody$entity3$sce.entityFromNative(otherNativeEntity);
    const contacts = thisBody.getContactPoints(collision);
    thisBody.fire('triggerexit', thisBody.entity, otherEntity, contacts);
  }

}

const properties$8 = ['touchEnabled'];
/**
 * @class
 * @category Component
 * @name UIInteractComponent
 * @augments Component
 * @classdesc Abstract UIInteractComponent class for UI Interaction.
 * @hideconstructor
 * @sdk 9.8.0
 */

class UIInteractComponent extends Component {
  constructor(entity, nativeClass, options) {
    if (entity && nativeClass) {
      if (entity.screenTransform) {
        super(entity, nativeClass);
        this.initialize(options, this.getProps());
      } else {
        throw new Error('UIInteractComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  getProps() {
    return properties$8;
  }
  /**
   *
   */


  get touchEnabled() {
    return this.native.touchEnabled;
  }
  /**
   *
   */


  set touchEnabled(value) {
    this.native.touchEnabled = value;
  }

}

const properties$9 = ['enabled', 'normalFrame', 'pressedFrame', 'disabledFrame', 'normalColor', 'pressedColor', 'disabledColor'];
/**
 * @class
 * @category Component
 * @name UIControlComponent
 * @augments Component
 * @classdesc Abstract UIControlComponent class for UI Controls.
 * @hideconstructor
 * @sdk 9.8.0
 */

class UIControlComponent extends UIInteractComponent {
  constructor(entity, nativeClass, options) {
    if (entity && nativeClass) {
      super(entity, nativeClass, options);
    } else {
      super();
    }
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$9);
  }
  /**
   * @name UIControlComponent#enabled
   * @type {boolean}
   * @description Flag to enable/disable the UI control.
   * @sdk 9.8.0
   */


  get enabled() {
    return this.native.enabled;
  }

  set enabled(value) {
    this.native.enabled = value;
  }
  /**
   * @name UIControlComponent#normalFrame
   * @type {number}
   * @description Frame number of normal state.
   * @sdk 9.8.0
   */


  get normalFrame() {
    return this.native.normalSprite;
  }

  set normalFrame(value) {
    this.native.normalSprite = value;
  }
  /**
   * @name UIControlComponent#pressedFrame
   * @type {number}
   * @description Frame number of pressed state.
   * @sdk 9.8.0
   */


  get pressedFrame() {
    return this.native.pressedSprite;
  }

  set pressedFrame(value) {
    this.native.pressedSprite = value;
  }
  /**
   * @name UIControlComponent#disabledFrame
   * @type {number}
   * @description Frame number of disabled state.
   * @sdk 9.8.0
   */


  get disabledFrame() {
    return this.native.disabledSprite;
  }

  set disabledFrame(value) {
    this.native.disabledSprite = value;
  }
  /**
   * @name UIControlComponent#normalColor
   * @type {Color}
   * @description Color of normal state.
   * @sdk 9.8.0
   */


  get normalColor() {
    return this.native.normalColor;
  }

  set normalColor(value) {
    this.native.normalColor = value;
  }
  /**
   * @name UIControlComponent#pressedColor
   * @type {Color}
   * @description Color of pressed state.
   * @sdk 9.8.0
   */


  get pressedColor() {
    return this.native.pressedColor;
  }

  set pressedColor(value) {
    this.native.pressedColor = value;
  }
  /**
   * @name UIControlComponent#disabledColor
   * @type {Color}
   * @description Color of disabled state.
   * @sdk 9.8.0
   */


  get disabledColor() {
    return this.native.disabledColor;
  }

  set disabledColor(value) {
    this.native.disabledColor = value;
  }

}

const properties$a = [];
const OnControlTouchDown = 1000;
/**
 * @class
 * @category Component
 * @name ButtonComponent
 * @augments UIControlComponent
 * @classdesc ButtonComponent class for UI Button.
 * @description Constructor to create an ButtonComponent instance.
 * To add an ButtonComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create ButtonComponent.
 * @example
 * // add ButtonComponent to entity
 * entity.addComponent('Button', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class ButtonComponent extends UIControlComponent {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'IFUIButton', options);
      this.registerCallbacks();
    } else {
      super();
    }
  }
  /**
   * @function
   * @name ButtonComponent#destroy
   * @description Destroy and clean up the component.
   * @sdk 9.8.0
   */


  destroy() {
    this.removeCallbacks();
    super.destroy();
  }

  static fromNative(entity, native) {
    const component = new ButtonComponent();

    if (native instanceof Amaz.IFUIButton) {
      component.initWithNative(entity, native, 'IFButton2d');
    } else {
      throw new Error('Incorrect argument to ButtonComponent::fromNative');
    }

    component.registerCallbacks();
    return component;
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$a);
  }

  registerCallbacks() {
    this.addListener(OnControlTouchDown, this.onClicked, this);
  }

  removeCallbacks() {
    this.removeListener(OnControlTouchDown, this.onClicked);
  }
  /**
   * @event
   * @name ButtonComponent#click
   * @description Fired when button is clicked.
   * @param {Entity} button - The clicked button entity.
   * @example
   * entity.button.on('click', function () {
   *     console.log('Button clicked');
   * });
   * @sdk 9.8.0
   */


  onClicked(thisButton) {
    thisButton.fire('click', thisButton.entity);
  }

}

const properties$b = ['mask'];
/**
 * @class
 * @category Component
 * @name UIEventSystem
 * @augments Component
 * @classdesc UIEventSystem class for ui events.
 * @description Constructor to create an UIEventSystem instance.
 * To add an UIEventSystem to an {@link Entity} with a {@link CameraComponent},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create UIEventSystem.
 * @example
 * // add UIEventSystem to camera entity for ui events
 * cameraEntity.addComponent('UIEventSystem', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class UIEventSystem extends Component {
  constructor(entity, options) {
    if (entity) {
      if (entity.camera) {
        // call super constructor
        super(entity, 'IFEventDistributor'); // initialize all options

        this.initialize(options, this.getProps());
      } else {
        throw new Error('UIEventSystem can only be added to an camera entity');
      }
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new UIEventSystem();

    if (native instanceof Amaz.IFEventDistributor) {
      component.initWithNative(entity, native, 'IFEventDistributor');
    } else {
      throw new Error('Incorrect argument to UIEventSystem::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$b;
  }
  /**
   * @name UIEventSystem#mask
   * @type {number}
   * @description The UI event system's mask.
   * @sdk 9.8.0
   */


  get mask() {
    return this.native.EventMask;
  }

  set mask(value) {
    this.native.EventMask = value;
  }

}

const properties$c = ['autoSize', 'center', 'size'];
const classMap$1 = /*#__PURE__*/new Map([[exports.UIColliderType.Box, 'IFBoxCollider']]);

function colliderTypeToClass(type) {
  if (!classMap$1.has(type)) {
    throw new Error('Unknown type of collider');
  }

  return classMap$1.get(type);
}
/**
 * @class
 * @category Component
 * @name UIColliderComponent
 * @augments Component
 * @classdesc UIColliderComponent class for UI collision detection.
 * @description Constructor to create an UIColliderComponent instance.
 * To add an UIColliderComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create UIColliderComponent.
 * @example
 * // add UIColliderComponent to entity
 * entity.addComponent('UICollider', options);
 * @hideconstructor
 * @sdk 9.8.0
 */


class UIColliderComponent extends Component {
  constructor(entity, options) {
    if (entity && options && options.hasOwnProperty('type')) {
      if (entity.screenTransform) {
        super(entity, colliderTypeToClass(options['type']));
        this.initialize(options, this.getProps());
      } else {
        throw new Error('UIColliderComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new UIColliderComponent();

    if (native instanceof Amaz.IFBoxCollider) {
      component.initWithNative(entity, native, 'IFBoxCollider');
      component.type = exports.UIColliderType.Box;
    } else {
      throw new Error('Incorrect argument to UIColliderComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$c;
  }
  /**
   * @name UIColliderComponent#autoSize
   * @type {boolean}
   * @description Collider's auto resize flag.
   * @sdk 9.8.0
   */


  get autoSize() {
    return this.native.autoAdjustCollider;
  }

  set autoSize(value) {
    this.native.autoAdjustCollider = value;
  }
  /**
   * @name UIColliderComponent#center
   * @type {Vec3}
   * @description Collider's center.
   * @sdk 9.8.0
   */


  get center() {
    return this.native.center;
  }

  set center(value) {
    this.native.center = value;
  }
  /**
   * @name UIColliderComponent#size
   * @type {Vec3}
   * @description Collider's size.
   * @sdk 9.8.0
   */


  get size() {
    return this.native.size;
  }

  set size(value) {
    this.native.size = value;
  }

}

const properties$d = ['fillEntity', 'thumbEntity', 'mode', 'direction', 'minValue', 'maxValue', 'step', 'value'];
const SliderValueChangedEvent = 1004;
/**
 * @class
 * @category Component
 * @name SliderComponent
 * @augments UIControlComponent
 * @classdesc SliderComponent class for UI slider.
 * @description Constructor to create an SliderComponent instance.
 * To add an SliderComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create SliderComponent.
 * @example
 * // add SliderComponent to entity
 * entity.addComponent('Slider', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class SliderComponent extends UIControlComponent {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'IFUISlider', options);
      this.registerCallbacks();
    } else {
      super();
    }
  }

  destroy() {
    this.removeCallbacks();
    super.destroy();
  }

  static fromNative(entity, native) {
    const component = new SliderComponent();

    if (native instanceof Amaz.IFUISlider) {
      component.initWithNative(entity, native, 'IFSlider2d');
    } else {
      throw new Error('Incorrect argument to SliderComponent::fromNative');
    }

    component.registerCallbacks();
    return component;
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$d);
  }

  registerCallbacks() {
    this.addListener(SliderValueChangedEvent, this.onValueChanged, this);
  }

  removeCallbacks() {
    this.removeListener(SliderValueChangedEvent, this.onValueChanged);
  }
  /**
   * @param thisSlider
   * @event
   * @name SliderComponent#change
   * @description Fired after slider's value has been changed.
   * @example
   * entity.slider.on('change', function () {
   *     console.log('slider's value was changed');
   * });
   * @sdk 9.8.0
   */


  onValueChanged(thisSlider) {
    thisSlider.fire('change', thisSlider.entity);
  }
  /**
   * @name SliderComponent#mode
   * @type {amg.SliderMode}
   * @description The slider's mode.
   * @sdk 9.8.0
   */


  get mode() {
    return this.native.mode;
  }

  set mode(value) {
    this.native.mode = value;
  }
  /**
   * @name SliderComponent#direction
   * @type {amg.UIMoveDirection}
   * @description The slider's direction.
   * @sdk 9.8.0
   */


  get direction() {
    return this.native.direction;
  }

  set direction(value) {
    this.native.direction = value;
  }
  /**
   * @name SliderComponent#minValue
   * @type {number}
   * @description The slider's min value.
   * @sdk 9.8.0
   */


  get minValue() {
    return this.native.minValue;
  }

  set minValue(value) {
    this.native.minValue = value;
  }
  /**
   * @name SliderComponent#maxValue
   * @type {number}
   * @description The slider's max value.
   * @sdk 9.8.0
   */


  get maxValue() {
    return this.native.maxValue;
  }

  set maxValue(value) {
    this.native.maxValue = value;
  }
  /**
   * @name SliderComponent#step
   * @type {number}
   * @description The slider's step.
   * @sdk 9.8.0
   */


  get step() {
    return this.native.steps;
  }

  set step(value) {
    this.native.steps = value;
  }
  /**
   * @name SliderComponent#value
   * @type {number}
   * @description The slider's value.
   * @sdk 9.8.0
   */


  get value() {
    return this.native.value;
  }

  set value(value) {
    this.native.value = value;
  }
  /**
   * @name SliderComponent#fillEntity
   * @type {Entity}
   * @description The slider's visual entity for filling.
   * @sdk 9.8.0
   */


  set fillEntity(value) {
    if (value.native) {
      this.native.fillTrans = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid fillEntity!');
    }
  }
  /**
   * @name SliderComponent#thumbEntity
   * @type {Entity}
   * @description The slider's thumb entity.
   * @sdk 9.8.0
   */


  set thumbEntity(value) {
    if (value.native) {
      this.native.thumbTrans = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid thumbEntity!');
    }
  }

}

const properties$e = [];
const OnControlTouchDown$1 = 1000;
/**
 * @class
 * @category Component
 * @name SliderThumbComponent
 * @augments UIControlComponent
 * @classdesc SliderThumbComponent class for UI slider's thumb.
 * @description Constructor to create an SliderThumbComponent instance.
 * To add an SliderThumbComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create SliderThumbComponent.
 * @example
 * // add SliderThumbComponent to entity
 * entity.addComponent('SliderThumb', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class SliderThumbComponent extends UIControlComponent {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'IFUISliderThumb', options);
      this.registerCallbacks();
    } else {
      super();
    }
  }

  destroy() {
    this.removeCallbacks();
    super.destroy();
  }

  static fromNative(entity, native) {
    const component = new SliderThumbComponent();

    if (native instanceof Amaz.IFUISliderThumb) {
      component.initWithNative(entity, native, 'IFSliderThumb2d');
    } else {
      throw new Error('Incorrect argument to SliderThumbComponent::fromNative');
    }

    return component;
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$e);
  }

  registerCallbacks() {
    this.addListener(OnControlTouchDown$1, this.onClicked, this);
  }

  removeCallbacks() {
    this.removeListener(OnControlTouchDown$1, this.onClicked);
  }
  /**
   * @param thisThumb
   * @event
   * @name SliderThumbComponent#click
   * @description Fired after slider's thumb has been clicked.
   * @example
   * entity.slider.on('click', function () {
   *     console.log('slider's thumb was clicked');
   * });
   * @sdk 9.8.0
   */


  onClicked(thisThumb) {
    thisThumb.fire('click', thisThumb.entity);
  }

}

const properties$f = ['text', 'textColor', 'fontPath', 'fontSize', 'fontType', 'Alignment', 'fitType', 'spacing'];
/**
 * @class
 * @category Component
 * @name LabelComponent
 * @augments Component
 * @classdesc LabelComponent class for UI Label.
 * @description Constructor to create an LabelComponent instance.
 * To add an LabelComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create LabelComponent.
 * @example
 * // add LabelComponent to entity
 * entity.addComponent('Label', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class LabelComponent extends WidgetComponent {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'IFUILabel', options);
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new LabelComponent();

    if (native instanceof Amaz.IFUILabel) {
      component.initWithNative(entity, native, 'IFUILabel');
    } else {
      throw new Error('Incorrect argument to LabelComponent::fromNative');
    }

    return component;
  }

  getProps() {
    const baseProps = super.getProps();
    return baseProps.concat(properties$f);
  }
  /**
   * @name LabelComponent#text
   * @type {string}
   * @description Label's text.
   * @sdk 9.8.0
   */


  get text() {
    return this.native.text;
  }

  set text(value) {
    this.native.text = value;
  }
  /**
   * @name LabelComponent#textColor
   * @type {Color}
   * @description Label's textColor.
   * @sdk 9.8.0
   */


  get textColor() {
    return this.native.textColor;
  }

  set textColor(value) {
    this.native.textColor = value;
  }
  /**
   * @name LabelComponent#fontPath
   * @type {string}
   * @description Label's fontPath.
   * @sdk 9.8.0
   */


  get fontPath() {
    return this.native.fontPath;
  }

  set fontPath(value) {
    this.native.fontPath = value;
  }
  /**
   * @name LabelComponent#fontSize
   * @type {number}
   * @description Label's fontSize.
   * @sdk 9.8.0
   */


  get fontSize() {
    return this.native.fontSize;
  }

  set fontSize(value) {
    this.native.fontSize = value;
  }
  /**
   * @name LabelComponent#fontType
   * @type {amg.LabelFontType}
   * @description Label's fontType.
   * @sdk 9.8.0
   */


  get fontType() {
    return this.native.fontType;
  }

  set fontType(value) {
    this.native.fontType = value;
  }
  /**
   * @name LabelComponent#alignment
   * @type {amg.LabelAlignment}
   * @description Label's alignment.
   * @sdk 9.8.0
   */


  get alignment() {
    return this.native.alignment;
  }

  set alignment(value) {
    this.native.alignment = value;
  }
  /**
   * @name LabelComponent#fitType
   * @type {amg.LabelFitType}
   * @description Label's fitType.
   * @sdk 9.8.0
   */


  get fitType() {
    return this.native.fitType;
  }

  set fitType(value) {
    this.native.fitType = value;
  }
  /**
   * @name LabelComponent#spacing
   * @type {Vec2}
   * @description Label's spacing.
   * @sdk 9.8.0
   */


  get spacing() {
    return this.native.spacing;
  }

  set spacing(value) {
    this.native.spacing = value;
  }

}

const properties$g = ['type', 'size'];
/**
 * @class
 * @category Component
 * @name CanvasScalerComponent
 * @augments Component
 * @classdesc CanvasScalerComponent class for configure the design resolution.
 * @description Constructor to create an CanvasScalerComponent instance.
 * To add an CanvasScalerComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create CanvasScalerComponent.
 * @example
 * // add CanvasScalerComponent to entity
 * entity.addComponent('CanvasScaler', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class CanvasScalerComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      if (entity.screenTransform) {
        // call super constructor
        super(entity, 'IFCanvas2d'); // initialize all options

        this.initialize(options, this.getProps());
      } else {
        throw new Error('Canvas2DComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new CanvasScalerComponent();

    if (native instanceof Amaz.IFCanvas2d) {
      component.initWithNative(entity, native, 'IFCanvas2d');
    } else {
      throw new Error('Incorrect argument to Canvas2DComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$g;
  }
  /**
   * @name CanvasScalerComponent#type
   * @type {amg.CanvasScalerType}
   * @description Canvas's type.
   * @sdk 9.8.0
   */


  get type() {
    return this.native.resolutionType;
  }

  set type(value) {
    this.native.resolutionType = value;
  }
  /**
   * @name CanvasScalerComponent#size
   * @type {Vec2}
   * @description Canvas's size (in pixels).
   * @sdk 9.8.0
   */


  get size() {
    return this.native.resolutionSize;
  }

  set size(value) {
    this.native.resolutionSize = value;
  }

}

const properties$h = ['type', 'sizeMode', 'gridMode', 'verticalDirection', 'horizontalDirection', 'sortMode', 'cellSize', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'horizontalSpace', 'verticalSpace', 'useScaledSize', 'excludeInvisible'];
/**
 * @class
 * @category Component
 * @name LayoutComponent
 * @augments Component
 * @classdesc LayoutComponent class for laying out 2d components.
 * @description Constructor to create an LayoutComponent instance.
 * To add an LayoutComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create LayoutComponent.
 * @example
 * // add LayoutComponent to entity
 * entity.addComponent('Layout', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class LayoutComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      if (entity.screenTransform) {
        super(entity, 'IFUIGrid');
        this.initialize(options, this.getProps());
      } else {
        throw new Error('LayoutComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new LayoutComponent();

    if (native instanceof Amaz.IFUIGrid) {
      component.initWithNative(entity, native, 'IFUIGrid');
    } else {
      throw new Error('Incorrect argument to LayoutComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$h;
  }
  /**
   * @name LayoutComponent#type
   * @type {amg.LayoutType}
   * @description Layout's type.
   * @sdk 9.8.0
   */


  get type() {
    return this.native.type;
  }

  set type(value) {
    this.native.type = value;
  }
  /**
   * @name LayoutComponent#sizeMode
   * @type {amg.LayoutSizeMode}
   * @description Layout's size mode.
   * @sdk 9.8.0
   */


  get sizeMode() {
    return this.native.resizeMode;
  }

  set sizeMode(value) {
    this.native.resizeMode = value;
  }
  /**
   * @name LayoutComponent#gridMode
   * @type {amg.LayoutGridMode}
   * @description Layout's grid mode.
   * @sdk 9.8.0
   */


  get gridMode() {
    return this.native.startAxis;
  }

  set gridMode(value) {
    this.native.startAxis = value;
  }
  /**
   * @name LayoutComponent#verticalDirection
   * @type {amg.LayoutVerticalDirection}
   * @description Layout's vertical direction.
   * @sdk 9.8.0
   */


  get verticalDirection() {
    return this.native.verticalDirection;
  }

  set verticalDirection(value) {
    this.native.verticalDirection = value;
  }
  /**
   * @name LayoutComponent#horizontalDirection
   * @type {amg.LayoutHorizontalDirection}
   * @description Layout's horizontal direction.
   * @sdk 9.8.0
   */


  get horizontalDirection() {
    return this.native.horizontalDirection;
  }

  set horizontalDirection(value) {
    this.native.horizontalDirection = value;
  }
  /**
   * @name LayoutComponent#sortMode
   * @type {amg.LayoutSortMode}
   * @description Layout's sort mode.
   * @sdk 9.8.0
   */


  get sortMode() {
    return this.native.sortingType;
  }

  set sortMode(value) {
    this.native.sortingType = value;
  }
  /**
   * @name LayoutComponent#cellSize
   * @type {Vec2}
   * @description Layout's cell size.
   * @sdk 9.8.0
   */


  get cellSize() {
    return this.native.cellSize;
  }

  set cellSize(value) {
    this.native.cellSize = value;
  }
  /**
   * @name LayoutComponent#paddingLeft
   * @type {number}
   * @description Layout's left padding.
   * @sdk 9.8.0
   */


  get paddingLeft() {
    return this.native.paddingLeft;
  }

  set paddingLeft(value) {
    this.native.paddingLeft = value;
  }
  /**
   * @name LayoutComponent#paddingRight
   * @type {number}
   * @description Layout's right padding.
   * @sdk 9.8.0
   */


  get paddingRight() {
    return this.native.paddingRight;
  }

  set paddingRight(value) {
    this.native.paddingRight = value;
  }
  /**
   * @name LayoutComponent#paddingTop
   * @type {number}
   * @description Layout's top padding.
   * @sdk 9.8.0
   */


  get paddingTop() {
    return this.native.paddingTop;
  }

  set paddingTop(value) {
    this.native.paddingTop = value;
  }
  /**
   * @name LayoutComponent#paddingBottom
   * @type {number}
   * @description Layout's bottom padding.
   * @sdk 9.8.0
   */


  get paddingBottom() {
    return this.native.paddingBottom;
  }

  set paddingBottom(value) {
    this.native.paddingBottom = value;
  }
  /**
   * @name LayoutComponent#horizontalSpace
   * @type {number}
   * @description Layout's horizontal space.
   * @sdk 9.8.0
   */


  get horizontalSpace() {
    return this.native.horizontalSpace;
  }

  set horizontalSpace(value) {
    this.native.horizontalSpace = value;
  }
  /**
   * @name LayoutComponent#verticalSpace
   * @type {number}
   * @description Layout's vertical space.
   * @sdk 9.8.0
   */


  get verticalSpace() {
    return this.native.verticalSpace;
  }

  set verticalSpace(value) {
    this.native.verticalSpace = value;
  }
  /**
   * @name LayoutComponent#useScaledSize
   * @type {boolean}
   * @description Layout's use scaled size flag.
   * @sdk 9.8.0
   */


  get useScaledSize() {
    return this.native.affectedByScale;
  }

  set useScaledSize(value) {
    this.native.affectedByScale = value;
  }
  /**
   * @name LayoutComponent#excludeInvisible
   * @type {boolean}
   * @description Layout's exclude invisible cell flag.
   * @sdk 9.8.0
   */


  get excludeInvisible() {
    return this.native.filterInvisibleChildren;
  }

  set excludeInvisible(value) {
    this.native.filterInvisibleChildren = value;
  }

}

const properties$i = ['target', 'leftTarget', 'rightTarget', 'topTarget', 'bottomTarget', 'leftAnchor', 'rightAnchor', 'topAnchor', 'bottomAnchor', 'leftOffset', 'rightOffset', 'topOffset', 'bottomOffset'];
/**
 * @class
 * @category Component
 * @name AlignmentComponent
 * @augments Component
 * @classdesc AlignmentComponent class for aligning UI entities.
 * @description Constructor to create an AlignmentComponent instance.
 * To add an AlignmentComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create AlignmentComponent.
 * @example
 * // add AlignmentComponent to entity
 * entity.addComponent('Alignment', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class AlignmentComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      if (entity.screenTransform) {
        super(entity, 'IFUIConstraints');
        this.initialize(options, this.getProps());
      } else {
        throw new Error('AlignmentComponent can only be added to an 2d entity');
      }
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new AlignmentComponent();

    if (native instanceof Amaz.IFUIConstraints) {
      component.initWithNative(entity, native, 'IFUIConstraints');
    } else {
      throw new Error('Incorrect argument to AlignmentComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$i;
  }
  /**
   * @name AlignmentComponent#target
   * @type {Entity}
   * @description Target entity to align with.
   * It is used for left/right/top/bottom targets if they are not set.
   * @sdk 9.8.0
   */


  set target(value) {
    if (value.native) {
      this.native.target = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid target');
    }
  }
  /**
   * @name AlignmentComponent#leftTarget
   * @type {Entity}
   * @description Left target entity to align with.
   * @sdk 9.8.0
   */


  set leftTarget(value) {
    if (value.native) {
      this.native.leftTarget = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid leftTarget!');
    }
  }
  /**
   * @name AlignmentComponent#rightTarget
   * @type {Entity}
   * @description Right target entity to align with.
   * @sdk 9.8.0
   */


  set rightTarget(value) {
    if (value.native) {
      this.native.rightTarget = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid rightTarget!');
    }
  }
  /**
   * @name AlignmentComponent#bottomTarget
   * @type {Entity}
   * @description Bottom target entity to align with.
   * @sdk 9.8.0
   */


  set bottomTarget(value) {
    if (value.native) {
      this.native.bottomTarget = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid bottomTarget!');
    }
  }
  /**
   * @name AlignmentComponent#topTarget
   * @type {Entity}
   * @description Top target entity to align with.
   * @sdk 9.8.0
   */


  set topTarget(value) {
    if (value.native) {
      this.native.topTarget = value.native.getComponent('IFTransform2d');
    } else {
      throw new Error('Invalid topTarget!');
    }
  }
  /**
   * @name AlignmentComponent#leftAnchor
   * @type {number}
   * @description Left anchor(0.0-1.0). Percentage of the size of the target.
   * @sdk 9.8.0
   */


  get leftAnchor() {
    return this.native.leftRange;
  }

  set leftAnchor(value) {
    this.native.leftRange = value;
  }
  /**
   * @name AlignmentComponent#rightAnchor
   * @type {number}
   * @description Right anchor(0.0-1.0). Percentage of the size of the target.
   * @sdk 9.8.0
   */


  get rightAnchor() {
    return this.native.rightRange;
  }

  set rightAnchor(value) {
    this.native.rightRange = value;
  }
  /**
   * @name AlignmentComponent#topAnchor
   * @type {number}
   * @description Top anchor(0.0-1.0). Percentage of the size of the target.
   * @sdk 9.8.0
   */


  get topAnchor() {
    return this.native.topRange;
  }

  set topAnchor(value) {
    this.native.topRange = value;
  }
  /**
   * @name AlignmentComponent#bottomAnchor
   * @type {number}
   * @description Bottom anchor(0.0-1.0). Percentage of the size of the target.
   * @sdk 9.8.0
   */


  get bottomAnchor() {
    return this.native.bottomRange;
  }

  set bottomAnchor(value) {
    this.native.bottomRange = value;
  }
  /**
   * @name AlignmentComponent#leftOffset
   * @type {number}
   * @description Left offset(in pixels). Offset from target's anchor.
   * @sdk 9.8.0
   */


  get leftOffset() {
    return this.native.leftOffset;
  }

  set leftOffset(value) {
    this.native.leftOffset = value;
  }
  /**
   * @name AlignmentComponent#rightOffset
   * @type {number}
   * @description Right offset(in pixels). Offset from target's anchor.
   * @sdk 9.8.0
   */


  get rightOffset() {
    return this.native.rightOffset;
  }

  set rightOffset(value) {
    this.native.rightOffset = value;
  }
  /**
   * @name AlignmentComponent#topOffset
   * @type {number}
   * @description Top offset(in pixels). Offset from target's anchor.
   * @sdk 9.8.0
   */


  get topOffset() {
    return this.native.topOffset;
  }

  set topOffset(value) {
    this.native.topOffset = value;
  }
  /**
   * @name AlignmentComponent#bottomOffset
   * @type {number}
   * @description Bottom offset(in pixels). Offset from target's anchor.
   * @sdk 9.8.0
   */


  get bottomOffset() {
    return this.native.bottomOffset;
  }

  set bottomOffset(value) {
    this.native.bottomOffset = value;
  }

}

const properties$j = ['otherEntity', 'linearLowerLimit', 'linearUpperLimit', 'angularLowerLimit', 'angularUpperLimit', 'positionOffset', 'otherPositionOffset', 'rotationOffset', 'otherRotationOffset', 'linearCorrection', 'linearSoftness', 'angularCorrection', 'angularSoftness'];
/**
 * @class
 * @category Component
 * @name GenericJoint3DComponent
 * @augments Component
 * @classdesc GenericJoint3DComponent class for simulating physics 3d generic joint.
 * @description Constructor to create an GenericJoint3DComponent instance.
 * To add an GenericJoint3DComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create GenericJoint3DComponent.
 * @example
 * // add GenericJoint3DComponent to entity
 * entity.addComponent('GenericJoint3D', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class GenericJoint3DComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'GenericJoint3D');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new GenericJoint3DComponent();

    if (native instanceof Amaz.GenericJoint3D) {
      component.initWithNative(entity, native, 'GenericJoint3D');
    } else {
      throw new Error('Incorrect argument to GenericJoint3DComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$j;
  }
  /**
   * @name GenericJoint3DComponent#otherEntity
   * @type {Entity}
   * @description Other connected entity.
   * @readonly
   * @sdk 9.8.0
   */


  set otherEntity(value) {
    if (value.native) {
      this.native.connectedBody = value.native.getComponent('RigidBody3D');
    } else {
      throw new Error('Invalid target');
    }
  }

  set linearLowerLimit(value) {
    this.native.linearLowerLimit = value;
  }
  /**
   * @name GenericJoint3DComponent#linearLowerLimit
   * @type {Vec3}
   * @description Joint's linear lower limit.
   * @readonly
   * @sdk 9.8.0
   */


  get linearLowerLimit() {
    return this.native.linearLowerLimit;
  }

  set linearUpperLimit(value) {
    this.native.linearUpperLimit = value;
  }
  /**
   * @name GenericJoint3DComponent#linearUpperLimit
   * @type {Vec3}
   * @description Joint's linear upper limit.
   * @readonly
   * @sdk 9.8.0
   */


  get linearUpperLimit() {
    return this.native.linearUpperLimit;
  }

  set angularLowerLimit(value) {
    this.native.angularLowerLimit = value;
  }
  /**
   * @name GenericJoint3DComponent#angularLowerLimit
   * @type {Vec3}
   * @description Joint's angular lower limit.
   * @readonly
   * @sdk 9.8.0
   */


  get angularLowerLimit() {
    return this.native.angularLowerLimit;
  }

  set angularUpperLimit(value) {
    this.native.angularUpperLimit = value;
  }
  /**
   * @name GenericJoint3DComponent#angularUpperLimit
   * @type {Vec3}
   * @description Joint's angular upper limit.
   * @readonly
   * @sdk 9.8.0
   */


  get angularUpperLimit() {
    return this.native.angularUpperLimit;
  }

  set positionOffset(value) {
    this.native.posAnchorA = value;
  }
  /**
   * @name GenericJoint3DComponent#positionOffset
   * @type {Vec3}
   * @description Joint's position offset.
   * @readonly
   * @sdk 9.8.0
   */


  get positionOffset() {
    return this.native.posAnchorA;
  }

  set otherPositionOffset(value) {
    this.native.posAnchorB = value;
  }
  /**
   * @name GenericJoint3DComponent#otherPositionOffset
   * @type {Vec3}
   * @description Other entity's position offset.
   * @readonly
   * @sdk 9.8.0
   */


  get otherPositionOffset() {
    return this.native.posAnchorB;
  }

  set rotationOffset(value) {
    this.native.rotAnchorA = value;
  }
  /**
   * @name GenericJoint3DComponent#rotationOffset
   * @type {Vec3}
   * @description Joint's rotation offset.
   * @readonly
   * @sdk 9.8.0
   */


  get rotationOffset() {
    return this.native.rotAnchorA;
  }

  set otherRotationOffset(value) {
    this.native.rotAnchorB = value;
  }
  /**
   * @name GenericJoint3DComponent#otherRotationOffset
   * @type {Vec3}
   * @description Other entity's rotation offset.
   * @readonly
   * @sdk 9.8.0
   */


  get otherRotationOffset() {
    return this.native.rotAnchorB;
  }

  set linearCorrection(value) {
    this.native.erpLinear = value;
  }
  /**
   * @name GenericJoint3DComponent#linearCorrection
   * @type {number}
   * @description Joint's linear correction.
   * @readonly
   * @sdk 9.8.0
   */


  get linearCorrection() {
    return this.native.erpLinear;
  }

  set linearSoftness(value) {
    this.native.cfmLinear = value;
  }
  /**
   * @name GenericJoint3DComponent#linearSoftness
   * @type {number}
   * @description Joint's linear softness.
   * @readonly
   * @sdk 9.8.0
   */


  get linearSoftness() {
    return this.native.cfmLinear;
  }

  set angularCorrection(value) {
    this.native.erpAngular = value;
  }
  /**
   * @name GenericJoint3DComponent#angularCorrection
   * @type {number}
   * @description Joint's angular correction.
   * @readonly
   * @sdk 9.8.0
   */


  get angularCorrection() {
    return this.native.erpAngular;
  }

  set angularSoftness(value) {
    this.native.cfmAngular = value;
  }
  /**
   * @name GenericJoint3DComponent#angularSoftness
   * @type {number}
   * @description Joint's angular softness.
   * @readonly
   * @sdk 9.8.0
   */


  get angularSoftness() {
    return this.native.cfmAngular;
  }

}

const properties$k = ['animations'];
/**
 * @class
 * @category Component
 * @name AnimationComponent
 * @augments Component
 * @classdesc AnimationComponent class for playing animations.
 * @description Constructor to create an AnimationComponent instance.
 * To add an AnimationComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create AnimationComponent.
 * @example
 * // add AnimationComponent to entity
 * entity.addComponent('Animation', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class AnimationComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'Animator');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new AnimationComponent();

    if (native instanceof Amaz.Animator) {
      component.initWithNative(entity, native, 'Animator');
    } else {
      throw new Error('Incorrect argument in AnimationComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$k;
  }
  /**
   * @function
   * @name AnimationComponent#play
   * @description Play animation.
   * @param {string} name - Name of the animation.
   * @param {AnimationPlayOptions} state - Options to play animation.
   * @param {amg.AnimationPlayMode} state.playMode - Play mode.
   * @param {number} state.speed - Play speed.
   * @param {number} state.fadeTime - Fade time.
   * @param {number} state.startTime - Start time.
   * @sdk 9.8.0
   */


  play(name, state) {
    const curState = {
      playMode: state && state.playMode !== undefined ? state.playMode : exports.AnimationPlayMode.Once,
      speed: state && state.speed !== undefined ? state.speed : 1.0,
      fadeTime: state && state.fadeTime !== undefined ? state.fadeTime : 0.0,
      startTime: state && state.startTime !== undefined ? state.startTime : 0.0
    };
    this.native.play(name, curState.playMode, curState.speed, curState.fadeTime, curState.startTime);
  }
  /**
   * @function
   * @name AnimationComponent#stop
   * @description Stop animation.
   * @sdk 9.8.0
   */


  stop() {
    this.native.stopAllAnimations();
  }
  /**
   * @function
   * @name AnimationComponent#pause
   * @description Pause animation.
   * @sdk 9.8.0
   */


  pause() {
    this.native.pauseAnimator();
  }
  /**
   * @function
   * @name AnimationComponent#resume
   * @description Resume animation.
   * @sdk 9.8.0
   */


  resume() {
    this.native.resumeAnimator();
  }
  /**
   * @name AnimationComponent#animations
   * @type {Array<Animation>}
   * @description The list of animations.
   * @sdk 9.8.0
   */


  get animations() {
    const value = [];
    const animations = this.native.animations;

    for (let i = 0; i < animations.size(); i++) {
      value.push(animations.get(i));
    }

    return value;
  }

  set animations(value) {
    const animations = new Amaz.Vector();

    for (const animation of value) {
      animations.pushBack(animation);
    }

    this.native.animations = animations;
  }

}

const properties$l = ['audio', 'autoPlay', 'loop'];
/**
 * @class
 * @category Component
 * @name AudioComponent
 * @augments Component
 * @classdesc AudioComponent class for playing audio.
 * @description Constructor to create an AudioComponent instance.
 * To add an AudioComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create AudioComponent.
 * @example
 * // add AudioComponent to entity
 * entity.addComponent('audio', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class AudioComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'Audio');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new AudioComponent();

    if (native instanceof Amaz.Audio) {
      component.initWithNative(entity, native, 'Audio');
    } else {
      throw new Error('Incorrect argument in AudioComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$l;
  }
  /**
   * @name AudioComponent#audio
   * @type {Audio}
   * @description The audio clip.
   * @sdk 9.8.0
   */


  get audio() {
    return this.native.clip;
  }

  set audio(value) {
    this.native.clip = value;
  }
  /**
   * @name AudioComponent#autoPlay
   * @type {boolean}
   * @description Flag to auto play on awake.
   * @sdk 9.8.0
   */


  get autoPlay() {
    return this.native.playOnAwake;
  }

  set autoPlay(value) {
    this.native.playOnAwake = value;
  }
  /**
   * @name AudioComponent#loop
   * @type {boolean}
   * @description Flag for looping.
   * @sdk 9.8.0
   */


  get loop() {
    return this.native.loop;
  }

  set loop(value) {
    this.native.loop = value;
  }
  /**
   * @function
   * @name AudioComponent#play
   * @description Play audio.
   * @sdk 9.8.0
   */


  play() {
    this.native.play();
  }
  /**
   * @function
   * @name AudioComponent#stop
   * @description Stop audio.
   * @sdk 9.8.0
   */


  stop() {
    this.native.stop();
  }
  /**
   * @function
   * @name AudioComponent#pause
   * @description Pause audio.
   * @sdk 9.8.0
   */


  pause() {
    this.native.pause();
  }
  /**
   * @function
   * @name AudioComponent#resume
   * @description Resume audio.
   * @sdk 9.8.0
   */


  resume() {
    this.native.resume();
  }
  /**
   * @function
   * @name AudioComponent#reset
   * @description Reset audio.
   * @sdk 9.8.0
   */


  reset() {
    this.native.reset();
  }

}

const properties$m = ['position', 'rotation', 'scale', 'size', 'pivot', 'flipX', 'flipY'];
/**
 * @class
 * @category Component
 * @name ScreenTransformComponent
 * @augments Component
 * @classdesc ScreenTransformComponent class for placing screen based entities
 * @description Constructor to create an ScreenTransformComponent instance.
 * To add an ScreenTransformComponent to an {@link Entity},
 * use {@link Entity#addComponent}.
 * @param {Entity} entity - The entity.
 * @param {object} options - Options to create ScreenTransformComponent.
 * @example
 * // add ScreenTransformComponent to entity
 * entity.addComponent('ScreenTransform', options);
 * @hideconstructor
 * @sdk 9.8.0
 */

class ScreenTransformComponent extends Component {
  constructor(entity, options) {
    if (entity) {
      super(entity, 'IFTransform2d');
      this.initialize(options, this.getProps());
    } else {
      super();
    }
  }

  static fromNative(entity, native) {
    const component = new ScreenTransformComponent();

    if (native instanceof Amaz.IFTransform2d) {
      component.initWithNative(entity, native, 'IFTransform2d');
    } else {
      throw new Error('Incorrect argument in ScreenTransformComponent::fromNative');
    }

    return component;
  }

  getProps() {
    return properties$m;
  }
  /**
   * @name ScreenTransformComponent#position
   * @type {Vec2}
   * @description Local position of 2d entity.
   * @sdk 9.8.0
   */


  get position() {
    return this.native.position;
  }

  set position(value) {
    this.native.position = value;
  }
  /**
   * @name ScreenTransformComponent#scale
   * @type {Vec2}
   * @description Local scale of 2d entity.
   * @sdk 9.8.0
   */


  get scale() {
    return this.native.scale;
  }

  set scale(value) {
    this.native.scale = value;
  }
  /**
   * @name ScreenTransformComponent#rotation
   * @type {number}
   * @description Local rotation of 2d entity.
   * @sdk 9.8.0
   */


  get rotation() {
    return this.native.rotation;
  }

  set rotation(value) {
    this.native.rotation = value;
  }
  /**
   * @name ScreenTransformComponent#size
   * @type {Vec2}
   * @description Size of 2d entity.
   * @sdk 9.8.0
   */


  get size() {
    return this.native.size;
  }

  set size(value) {
    this.native.size = value;
  }
  /**
   * @name ScreenTransformComponent#pivot
   * @type {Vec2}
   * @description Pivot of 2d entity.
   * @sdk 9.8.0
   */


  get pivot() {
    return this.native.pivot;
  }

  set pivot(value) {
    this.native.pivot = value;
  }
  /**
   * @name ScreenTransformComponent#flipX
   * @type {boolean}
   * @description Flip the 2d entity horizontally.
   * @sdk 9.8.0
   */


  get flipX() {
    return this.native.flipX;
  }

  set flipX(value) {
    this.native.flipX = value;
  }
  /**
   * @name ScreenTransformComponent#flipY
   * @type {boolean}
   * @description Flip the 2d entity vertically.
   * @sdk 9.8.0
   */


  get flipY() {
    return this.native.flipY;
  }

  set flipY(value) {
    this.native.flipY = value;
  }

}

/**
 * @class
 * @category Core
 * @name Entity
 * @augments EventHandler
 * @classdesc An Entity class represents a game object.
 * @description Constructor to create an Entity instance.
 * @param {string} name - The name of the entity.
 * @param {object} options - Options to create entity.
 * @example
 * // create the Entity instance
 * const entity = new amg.Entity('newEntity', options);
 * @sdk 9.8.0
 */

/**
 * @name Entity#scene
 * @type {Scene}
 * @description Scene of the entity.
 * @sdk 9.8.0
 */

class Entity extends EventHandler {
  constructor(name, options) {
    super();

    if (options != null && options.scene) {
      this.scene = options == null ? void 0 : options.scene;
    } else {
      var _Engine$engine;

      this.scene = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.scene;
    }

    if (name && typeof name === 'string') {
      var _this$scene;

      if (!this.scene) {
        throw new Error('No active scene found!');
      }

      this.native = this.scene.native.createEntity(name);
      this.layer = options != null && options.layer ? options == null ? void 0 : options.layer : 0;
      this.tags = options != null && options.tags ? options == null ? void 0 : options.tags : [0];
      this._transform = this.native.addComponent('Transform');
      (_this$scene = this.scene) == null ? void 0 : _this$scene.addEntity(this);
    }
  }

  static fromNative(native, scene) {
    const entity = new Entity();

    if (native instanceof Amaz.Entity) {
      entity.initWithNative(native, scene);
    } else {
      throw new Error('Incorrect argument to Entity::fromNative');
    }

    return entity;
  }

  initWithNative(native, scene) {
    this.scene = scene;
    this.native = native;
    this._transform = this.native.getComponent('Transform');
    this.scene.addEntity(this);
  }
  /**
   * @name Entity#name
   * @type {string}
   * @description Name of the entity.
   * @sdk 9.8.0
   */


  get name() {
    return this.native.name;
  }

  set name(value) {
    this.native.name = value;
  }
  /**
   * @name Entity#parent
   * @type {Entity}
   * @description Parent entity.
   * @readonly
   * @sdk 9.8.0
   */


  get parent() {
    var _this$scene2;

    let native = undefined;

    if (this._transform && this._transform.parent) {
      native = this._transform.parent.entity;
    }

    return (_this$scene2 = this.scene) == null ? void 0 : _this$scene2.entityFromNative(native);
  }
  /**
   * @name Entity#enabled
   * @type {boolean}
   * @description Enable or disable this entity.
   * @sdk 9.8.0
   */


  get enabled() {
    return this.native.selfvisible;
  }

  set enabled(value) {
    this.native.visible = value;
  }
  /**
   * @name Entity#enabledInScene
   * @type {boolean}
   * @description Check if the entity enabled in scene.
   * @readonly
   * @sdk 9.8.0
   */


  get enabledInScene() {
    return this.native.visible;
  }
  /**
   * @name Entity#layer
   * @type {number}
   * @description 0 <= layer < {@link amg.EntityLayerMax}.
   * @sdk 9.8.0
   */


  get layer() {
    return this.native.layer;
  }

  set layer(value) {
    if (0 <= value && value < EntityLayerMax) {
      this.native.layer = value;
    } else {
      throw new Error('Invalid layer value!');
    }
  }
  /**
   * @name Entity#tags
   * @type {number[]}
   * @description Entity's tags.
   * Tag is bitwise position, value in range 0 <= tag < {@link amg.EntityTagMax}.
   * @example
   * // Add/remove/check for tag
   * const entity = new amg.Entity('newEntity', options);
   * entity.addTag(tag);  // tag 0-31
   * if (entity.hasTag(tag)) { console.log('Entity has tag'); }
   * // OR
   * const playerTag = 0;
   * const obstacleTag = 1;
   * const isPlayerAndObstacle = playerTag | obstacleTag;
   * const entity = new amg.Entity('newEntity', {tag: playerTag | obstacleTag});
   * if (entity.hasTag(playerTag)) { console.log('Entity has player tag'); }
   * if (entity.hasTag(obstacleTag)) { console.log('Entity has obstacle tag'); }
   * if (entity.tags === isPlayerAndObstacle)) { console.log('Entity has both player and obstacle tag'); }
   * @sdk 9.8.0
   */


  get tags() {
    const tagArray = [];
    const tag = this.native.tag;

    for (let i = 0; i < EntityTagMax; ++i) {
      if (tag && 1 << i) {
        tagArray.push(i);
      }
    }

    return tagArray;
  }

  set tags(tagArray) {
    let tagMask = 0;

    for (const tag of tagArray) {
      if (0 <= tag && tag < EntityTagMax) {
        tagMask |= 1 << tag;
      } else {
        throw new Error('Invalid tag value!');
      }
    }

    this.native.tag = tagMask;
  }
  /**
   * @name Entity#screenTransform
   * @type {ScreenTransformComponent}
   * @description The screen transform component.
   * @readonly
   * @sdk 9.8.0
   */


  get screenTransform() {
    if (this._screenTransform === undefined) {
      if (this._transform instanceof Amaz.IFTransform2d) {
        this._screenTransform = ScreenTransformComponent.fromNative(this, this._transform);
      }
    }

    return this._screenTransform;
  }
  /**
   * @name Entity#camera
   * @type {CameraComponent}
   * @description The camera component.
   * @readonly
   * @sdk 9.8.0
   */


  get camera() {
    if (this._camera === undefined) {
      const nativeCamera = this.native.getComponent('Camera');

      if (nativeCamera) {
        this._camera = CameraComponent.fromNative(this, nativeCamera);
      }
    }

    return this._camera;
  }
  /**
   * @name Entity#model
   * @type {ModelComponent}
   * @description The model component.
   * @readonly
   * @sdk 9.8.0
   */


  get model() {
    if (this._model === undefined) {
      const nativeModel = this.native.getComponent('MeshRenderer');

      if (nativeModel) {
        this._model = ModelComponent.fromNative(this, nativeModel);
      }
    }

    return this._model;
  }
  /**
   * @name Entity#light
   * @type {LightComponent}
   * @description The light component.
   * @readonly
   * @sdk 9.8.0
   */


  get light() {
    if (this._light === undefined) {
      const nativeLight = this.native.getComponent('DirectionalLight') || this.native.getComponent('PointLight') || this.native.getComponent('SpotLight');

      if (nativeLight) {
        this._light = LightComponent.fromNative(this, nativeLight);
      }
    }

    return this._light;
  }
  /**
   * @name Entity#rigidBody
   * @type {RigidBody3DComponent}
   * @description The rigid body component.
   * @readonly
   * @sdk 9.8.0
   */


  get rigidBody() {
    if (this._rigidBody === undefined) {
      const nativeRigidBody = this.native.getComponent('RigidBody3D');

      if (nativeRigidBody && !nativeRigidBody.sensor) {
        this._rigidBody = RigidBody3DComponent.fromNative(this, nativeRigidBody);
      }
    }

    return this._rigidBody;
  }
  /**
   * @name Entity#trigger
   * @type {Trigger3DComponent}
   * @description The trigger component.
   * @readonly
   * @sdk 9.8.0
   */


  get trigger() {
    if (this._trigger === undefined) {
      const nativeTrigger = this.native.getComponent('RigidBody3D');

      if (nativeTrigger && nativeTrigger.sensor) {
        this._trigger = Trigger3DComponent.fromNative(this, nativeTrigger);
      }
    }

    return this._trigger;
  }
  /**
   * @name Entity#collider
   * @type {Collider3DComponent}
   * @description The collider component.
   * @readonly
   * @sdk 9.8.0
   */


  get collider() {
    if (this._collider === undefined) {
      const nativecollider = this.native.getComponent('BoxCollider3D') | this.native.getComponent('SphereCollider3D') | this.native.getComponent('CapsuleCollider3D');

      if (nativecollider) {
        this._collider = Collider3DComponent.fromNative(this, nativecollider);
      }
    }

    return this._collider;
  }
  /**
   * @name Entity#particleSystem
   * @type {ParticleSystemComponent}
   * @description The particle system component.
   * @readonly
   * @sdk 9.8.0
   */


  get particleSystem() {
    if (this._particleSystem === undefined) {
      const nativeParticles = this.native.getComponent('ParticleComponent');

      if (nativeParticles) {
        this._particleSystem = ParticleSystemComponent.fromNative(this, nativeParticles);
      }
    }

    return this._particleSystem;
  }
  /**
   * @name Entity#sprite
   * @type {SpriteComponent}
   * @description The sprite component.
   * @readonly
   * @sdk 9.8.0
   */


  get sprite() {
    if (this._sprite === undefined) {
      const native = this.native.getComponent('Sprite2DRenderer');

      if (native) {
        this._sprite = SpriteComponent.fromNative(this, native);
      }
    }

    return this._sprite;
  }
  /**
   * @name Entity#image
   * @type {ImageComponent}
   * @description The image component.
   * @readonly
   * @sdk 9.8.0
   */


  get image() {
    if (this._image === undefined) {
      const native = this.native.getComponent('IFSprite2d');

      if (native) {
        this._image = ImageComponent.fromNative(this, native);
      }
    }

    return this._image;
  }
  /**
   * @name Entity#canvas
   * @type {CanvasComponent}
   * @description The canvas component.
   * @readonly
   * @sdk 9.8.0
   */


  get canvas() {
    if (this._canvas === undefined) {
      const native = this.native.getComponent('IFLayer2d');

      if (native) {
        this._canvas = CanvasComponent.fromNative(this, native);
      }
    }

    return this._canvas;
  }
  /**
   * @name Entity#canvasScaler
   * @type {CanvasScalerComponent}
   * @description The canvas scaler component.
   * @readonly
   * @sdk 9.8.0
   */


  get canvasScaler() {
    if (this._canvasScaler === undefined) {
      const native = this.native.getComponent('IFCanvas2d');

      if (native) {
        this._canvasScaler = CanvasScalerComponent.fromNative(this, native);
      }
    }

    return this._canvasScaler;
  }
  /**
   * @name Entity#button
   * @type {ButtonComponent}
   * @description The button component.
   * @readonly
   * @sdk 9.8.0
   */


  get button() {
    if (this._button === undefined) {
      const native = this.native.getComponent('IFUIButton');

      if (native) {
        this._button = ButtonComponent.fromNative(this, native);
      }
    }

    return this._button;
  }
  /**
   * @name Entity#uiEventSystem
   * @type {UIEventSystemComponent}
   * @description The user interface event system component.
   * @readonly
   * @sdk 9.8.0
   */


  get uiEventSystem() {
    if (this._uiEventSystem === undefined) {
      const native = this.native.getComponent('IFEventDistributor');

      if (native) {
        this._uiEventSystem = UIEventSystem.fromNative(this, native);
      }
    }

    return this._uiEventSystem;
  }
  /**
   * @name Entity#uiCollider
   * @type {UIColliderComponent}
   * @description The user interface collider component.
   * @readonly
   * @sdk 9.8.0
   */


  get uiCollider() {
    if (this._uiCollider === undefined) {
      const native = this.native.getComponent('IFBoxCollider');

      if (native) {
        this._uiCollider = UIColliderComponent.fromNative(this, native);
      }
    }

    return this._uiCollider;
  }
  /**
   * @name Entity#slider
   * @type {SliderComponent}
   * @description The slider component.
   * @readonly
   * @sdk 9.8.0
   */


  get slider() {
    if (this._slider === undefined) {
      const native = this.native.getComponent('IFUISlider');

      if (native) {
        this._slider = SliderComponent.fromNative(this, native);
      }
    }

    return this._slider;
  }
  /**
   * @name Entity#sliderThumb
   * @type {SliderThumbComponent}
   * @description The slider thumb component.
   * @readonly
   * @sdk 9.8.0
   */


  get sliderThumb() {
    if (this._sliderThumb === undefined) {
      const native = this.native.getComponent('IFUISliderThumb');

      if (native) {
        this._sliderThumb = SliderThumbComponent.fromNative(this, native);
      }
    }

    return this._sliderThumb;
  }
  /**
   * @name Entity#label
   * @type {LabelComponent}
   * @description The label component.
   * @readonly
   * @sdk 9.8.0
   */


  get label() {
    if (this._label === undefined) {
      const native = this.native.getComponent('IFUILabel');

      if (native) {
        this._label = LabelComponent.fromNative(this, native);
      }
    }

    return this._label;
  }
  /**
   * @name Entity#seqAnimation
   * @type {SeqAnimationComponent}
   * @description The sequence animation component.
   * @readonly
   * @sdk 9.8.0
   */


  get seqAnimation() {
    if (this._seqAnimation === undefined) {
      const native = this.native.getComponent('AnimSeqComponent');

      if (native) {
        this._seqAnimation = SeqAnimationComponent.fromNative(this, native);
      }
    }

    return this._seqAnimation;
  }
  /**
   * @name Entity#layout
   * @type {LayoutComponent}
   * @description The layout component.
   * @readonly
   * @sdk 9.8.0
   */


  get layout() {
    if (this._layout === undefined) {
      const native = this.native.getComponent('IFUIGrid');

      if (native) {
        this._layout = LayoutComponent.fromNative(this, native);
      }
    }

    return this._layout;
  }
  /**
   * @name Entity#alignment
   * @type {AlignmentComponent}
   * @description The alignment component.
   * @readonly
   * @sdk 9.8.0
   */


  get alignment() {
    if (this._alignment === undefined) {
      const native = this.native.getComponent('IFUIConstraints');

      if (native) {
        this._alignment = AlignmentComponent.fromNative(this, native);
      }
    }

    return this._alignment;
  }
  /**
   * @name Entity#genericJoint
   * @type {GenericJoint3DComponent}
   * @description The generic joint component.
   * @readonly
   * @sdk 9.8.0
   */


  get genericJoint() {
    if (this._genericJoint === undefined) {
      const native = this.native.getComponent('GenericJoint3D');

      if (native) {
        this._genericJoint = GenericJoint3DComponent.fromNative(this, native);
      }
    }

    return this._genericJoint;
  }
  /**
   * @name Entity#animation
   * @type {AnimationComponent}
   * @description The animation component.
   * @readonly
   * @sdk 9.8.0
   */


  get animation() {
    if (this._animation === undefined) {
      const native = this.native.getComponent('Animator');

      if (native) {
        this._animation = AnimationComponent.fromNative(this, native);
      }
    }

    return this._animation;
  }
  /**
   * @name Entity#audio
   * @type {AudioComponent}
   * @description The audio component.
   * @readonly
   * @sdk 9.8.0
   */


  get audio() {
    if (this._audio === undefined) {
      const native = this.native.getComponent('Audio');

      if (native) {
        this._audio = AudioComponent.fromNative(this, native);
      }
    }

    return this._audio;
  }
  /**
   * @function
   * @name Entity#addComponent
   * @description Create a new component and add it to the entity.
   * @param {string} type - Type of the component to add.
   * @param {any} options - Options object to configure the component.
   * @sdk 9.8.0
   */


  addComponent(type, options) {
    switch (type) {
      case 'ScreenTransform':
        if (!this.screenTransform) {
          this.native.removeComponent('Transform');
          this._screenTransform = new ScreenTransformComponent(this, options);
          this._transform = this._screenTransform.native;
        }

        break;

      case 'Camera':
        if (!this.camera) {
          this._camera = new CameraComponent(this, options);
        }

        break;

      case 'Model':
        if (!this.model) {
          this._model = new ModelComponent(this, options);
        }

        break;

      case 'Light':
        if (!this.light) {
          this._light = new LightComponent(this, options);
        }

        break;

      case 'RigidBody3D':
        if (!this.rigidBody) {
          this._rigidBody = new RigidBody3DComponent(this, options);
        }

        break;

      case 'Trigger3D':
        if (!this.trigger) {
          this._trigger = new Trigger3DComponent(this, options);
        }

        break;

      case 'Collider3D':
        if (!this.collider) {
          this._collider = new Collider3DComponent(this, options);
        }

        break;

      case 'ParticleSystem':
        if (!this.particleSystem) {
          this._particleSystem = new ParticleSystemComponent(this, options);
        }

        break;

      case 'Sprite':
        if (!this.sprite) {
          this._sprite = new SpriteComponent(this, options);
        }

        break;

      case 'Image':
        if (!this.image) {
          this._image = new ImageComponent(this, options);
        }

        break;

      case 'Canvas':
        if (!this.canvas) {
          this._canvas = new CanvasComponent(this, options);
        }

        break;

      case 'CanvasScaler':
        if (!this.canvasScaler) {
          this._canvasScaler = new CanvasScalerComponent(this, options);
        }

        break;

      case 'Button':
        if (!this.button) {
          this._button = new ButtonComponent(this, options);
        }

        break;

      case 'UIEventSystem':
        if (!this.uiEventSystem) {
          this._uiEventSystem = new UIEventSystem(this, options);
        }

        break;

      case 'UICollider':
        if (!this.uiCollider) {
          this._uiCollider = new UIColliderComponent(this, options);
        }

        break;

      case 'Slider':
        if (!this.slider) {
          this._slider = new SliderComponent(this, options);
        }

        break;

      case 'SliderThumb':
        if (!this.sliderThumb) {
          this._sliderThumb = new SliderThumbComponent(this, options);
        }

        break;

      case 'Label':
        if (!this.label) {
          this._label = new LabelComponent(this, options);
        }

        break;

      case 'SeqAnimation':
        if (!this.seqAnimation) {
          this._seqAnimation = new SeqAnimationComponent(this, options);
        }

        break;

      case 'Layout':
        if (!this.layout) {
          this._layout = new LayoutComponent(this, options);
        }

        break;

      case 'Alignment':
        if (!this.alignment) {
          this._alignment = new AlignmentComponent(this, options);
        }

        break;

      case 'GenericJoint3D':
        if (!this.genericJoint) {
          this._genericJoint = new GenericJoint3DComponent(this, options);
        }

        break;

      case 'Animation':
        if (!this.animation) {
          this._animation = new AnimationComponent(this, options);
        }

        break;

      case 'Audio':
        if (!this.audio) {
          this._audio = new AudioComponent(this, options);
        }

        break;
    }
  }
  /**
   * @function
   * @name Entity#removeComponent
   * @description Create a new component and add it to the entity.
   * @param {string} type - Type of the component to add.
   * @sdk 9.8.0
   */


  removeComponent(type) {
    var _this$_screenTransfor, _this$_camera, _this$_model, _this$_light, _this$_rigidBody, _this$_trigger, _this$_collider, _this$_particleSystem, _this$_image, _this$_canvas, _this$_canvasScaler, _this$_sprite, _this$_button, _this$_uiEventSystem, _this$_uiCollider, _this$_slider, _this$_sliderThumb, _this$_label, _this$_seqAnimation, _this$_layout, _this$_alignment, _this$_genericJoint, _this$_animation, _this$_audio;

    switch (type) {
      case 'ScreenTransform':
        (_this$_screenTransfor = this._screenTransform) == null ? void 0 : _this$_screenTransfor.destroy();
        this._screenTransform = undefined;
        this._transform = this.native.addComponent('Transform');
        break;

      case 'Camera':
        (_this$_camera = this._camera) == null ? void 0 : _this$_camera.destroy();
        this._camera = undefined;
        break;

      case 'Model':
        (_this$_model = this._model) == null ? void 0 : _this$_model.destroy();
        this._model = undefined;
        break;

      case 'Light':
        (_this$_light = this._light) == null ? void 0 : _this$_light.destroy();
        this._light = undefined;
        break;

      case 'RigidBody3D':
        (_this$_rigidBody = this._rigidBody) == null ? void 0 : _this$_rigidBody.destroy();
        this._rigidBody = undefined;
        break;

      case 'Trigger3D':
        (_this$_trigger = this._trigger) == null ? void 0 : _this$_trigger.destroy();
        this._trigger = undefined;
        break;

      case 'Collider3D':
        (_this$_collider = this._collider) == null ? void 0 : _this$_collider.destroy();
        this._collider = undefined;
        break;

      case 'ParticleSystem':
        (_this$_particleSystem = this._particleSystem) == null ? void 0 : _this$_particleSystem.destroy();
        this._particleSystem = undefined;
        break;

      case 'Image':
        (_this$_image = this._image) == null ? void 0 : _this$_image.destroy();
        this._image = undefined;
        break;

      case 'Canvas':
        (_this$_canvas = this._canvas) == null ? void 0 : _this$_canvas.destroy();
        this._canvas = undefined;
        break;

      case 'CanvasScaler':
        (_this$_canvasScaler = this._canvasScaler) == null ? void 0 : _this$_canvasScaler.destroy();
        this._canvasScaler = undefined;
        break;

      case 'Sprite':
        (_this$_sprite = this._sprite) == null ? void 0 : _this$_sprite.destroy();
        this._sprite = undefined;
        break;

      case 'Button':
        (_this$_button = this._button) == null ? void 0 : _this$_button.destroy();
        this._button = undefined;
        break;

      case 'UIEventSystem':
        (_this$_uiEventSystem = this._uiEventSystem) == null ? void 0 : _this$_uiEventSystem.destroy();
        this._uiEventSystem = undefined;
        break;

      case 'UICollider':
        (_this$_uiCollider = this._uiCollider) == null ? void 0 : _this$_uiCollider.destroy();
        this._uiCollider = undefined;
        break;

      case 'Slider':
        (_this$_slider = this._slider) == null ? void 0 : _this$_slider.destroy();
        this._slider = undefined;
        break;

      case 'SliderThumb':
        (_this$_sliderThumb = this._sliderThumb) == null ? void 0 : _this$_sliderThumb.destroy();
        this._sliderThumb = undefined;
        break;

      case 'Label':
        (_this$_label = this._label) == null ? void 0 : _this$_label.destroy();
        this._label = undefined;
        break;

      case 'SeqAnimation':
        (_this$_seqAnimation = this._seqAnimation) == null ? void 0 : _this$_seqAnimation.destroy();
        this._seqAnimation = undefined;
        break;

      case 'Layout':
        (_this$_layout = this._layout) == null ? void 0 : _this$_layout.destroy();
        this._layout = undefined;
        break;

      case 'Alignment':
        (_this$_alignment = this._alignment) == null ? void 0 : _this$_alignment.destroy();
        this._alignment = undefined;
        break;

      case 'GenericJoint3D':
        (_this$_genericJoint = this._genericJoint) == null ? void 0 : _this$_genericJoint.destroy();
        this._genericJoint = undefined;
        break;

      case 'Animation':
        (_this$_animation = this._animation) == null ? void 0 : _this$_animation.destroy();
        this._animation = undefined;
        break;

      case 'Audio':
        (_this$_audio = this._audio) == null ? void 0 : _this$_audio.destroy();
        this._audio = undefined;
        break;
    }
  }
  /**
   * @function
   * @name Entity#addChild
   * @description Add a new child to this entity and set the parent
   * @param {Entity} entity - Child entity to add
   * @sdk 9.8.0
   */


  addChild(entity) {
    if (this._transform) {
      this._transform.addTransform(entity.native.getComponent('Transform'));
    }
  }
  /**
   * @function
   * @name Entity#removeChild
   * @description Remove the child from the children list.
   * @param {Entity} entity - Child entity to remove.
   * @sdk 9.8.0
   */


  removeChild(entity) {
    if (this._transform) {
      this._transform.removeTransform(entity.native.getComponent('Transform'));
    }
  }
  /**
   * @function
   * @name Entity#findByName
   * @description Find child entity by name.
   * @param {string} name - Entity's name.
   * @returns {Entity} - Found entity.
   * @sdk 9.8.0
   */


  findByName(name) {
    let foundEntity = undefined;

    if (this.name === name) {
      foundEntity = this;
    } else {
      for (const entity of this.children) {
        foundEntity = entity.findByName(name);

        if (foundEntity) {
          break;
        }
      }
    }

    return foundEntity;
  }
  /**
   * @function
   * @name Entity#findByTag
   * @description Find child entity by tag.
   * @param {number} tag - Entity's tag.
   * @returns {Entity} - Found entity.
   * @sdk 9.8.0
   */


  findByTag(tag) {
    let foundEntity = undefined;

    if (this.hasTag(tag)) {
      foundEntity = this;
    } else {
      for (const entity of this.children) {
        foundEntity = entity.findByTag(tag);

        if (foundEntity) {
          break;
        }
      }
    }

    return foundEntity;
  }
  /**
   * @function
   * @name Entity#findAllByName
   * @description Find child entities by name.
   * @param {string} name - Entity's name.
   * @returns {Entity[]} - Found entities.
   * @sdk 9.8.0
   */


  findAllByName(name) {
    const entities = [];

    if (this.name === name) {
      entities.push(this);
    }

    for (const entity of this.children) {
      entities.push(...entity.findAllByName(name));
    }

    return entities;
  }
  /**
   * @function
   * @name Entity#findAllByTag
   * @description Find child entities by tag.
   * @param {number} tag - Entity's tag.
   * @returns {Entity[]} - Found entities.
   * @sdk 9.8.0
   */


  findAllByTag(tag) {
    const entities = [];

    if (this.hasTag(tag)) {
      entities.push(this);
    }

    for (const entity of this.children) {
      entities.push(...entity.findAllByTag(tag));
    }

    return entities;
  }
  /**
   * @name Entity#position
   * @type {Vec3}
   * @description Local position of the entity.
   * @sdk 9.8.0
   */


  get position() {
    return this._transform.localPosition;
  }

  set position(value) {
    this._transform.localPosition = value;
  }
  /**
   * @name Entity#scale
   * @type {Vec3}
   * @description Local scale of the entity.
   * @sdk 9.8.0
   */


  get scale() {
    return this._transform.localScale;
  }

  set scale(value) {
    this._transform.localScale = value;
  }
  /**
   * @name Entity#rotation
   * @type {Vec3}
   * @description Local rotation of the entity in degrees.
   * @sdk 9.8.0
   */


  get rotation() {
    return this._transform.localEulerAngle;
  }

  set rotation(value) {
    this._transform.localEulerAngle = value;
  }
  /**
   * @name Entity#rotationQuat
   * @type {Quat}
   * @description Local rotation of the entity in Quat.
   * @sdk 9.8.0
   */


  get rotationQuat() {
    return this._transform.localOrientation;
  }

  set rotationQuat(value) {
    this._transform.localOrientation = value;
  }
  /**
   * @name Entity#worldPosition
   * @type {Vec3}
   * @description World position of the entity.
   * @sdk 9.8.0
   */


  get worldPosition() {
    return this._transform.worldPosition;
  }

  set worldPosition(value) {
    this._transform.worldPosition = value;
  }
  /**
   * @name Entity#worldScale
   * @type {Vec3}
   * @description World scale of the entity.
   * Notes: this is lossly scale, it is not correct when the child transform has rotation.
   * @sdk 9.8.0
   */


  get worldScale() {
    return this._transform.worldScale;
  }

  set worldScale(value) {
    this._transform.worldScale = value;
  }
  /**
   * @name Entity#worldRotation
   * @type {Quat}
   * @description World rotation of the entity.
   * @sdk 9.8.0
   */


  get worldRotation() {
    return this._transform.worldOrientation;
  }

  set worldRotation(value) {
    this._transform.worldOrientation = value;
  }
  /**
   * @name Entity#worldEulerAngles
   * @type {Vec3}
   * @description World eular angles of the entity in degrees.
   * @sdk 9.8.0
   */


  get worldEulerAngles() {
    return this._transform.worldEulerAngle;
  }

  set worldEulerAngles(value) {
    this._transform.worldEulerAngle = value;
  }
  /**
   * @function
   * @name Entity#addTag
   * @description Add tag for entity.
   * @param {number} tag - 0 <= tag < {@link amg.EntityTagMax}.
   * @sdk 9.8.0
   */


  addTag(tag) {
    if (tag >= 0 && tag < EntityTagMax) {
      this.native.addTag(tag);
    } else {
      throw new Error('Invalid tag number when adding tag. (valid tag: 0-31)');
    }
  }
  /**
   * @function
   * @name Entity#hasTag
   * @description Check if entity has a tag number.
   * @param {number} tag - 0 <= tag < {@link amg.EntityTagMax}.
   * @returns {boolean} True if entity has tag, False if entity does not has tag.
   * @sdk 9.8.0
   */


  hasTag(tag) {
    return this.native.hasTag(tag);
  }
  /**
   * @function
   * @name Entity#destroy
   * @description Destroy and clean up the entity.
   * @sdk 9.8.0
   */


  destroy() {
    this.scene.removeEntity(this);
  }
  /**
   * @name Entity#children
   * @type {Entity[]}
   * @description Entity's children.
   * @sdk 9.8.0
   */


  get children() {
    const orderedChildren = [];

    for (let i = 0; i < this._transform.children.size(); ++i) {
      var _this$scene3;

      const nativeChildTransform = this._transform.children.get(i);

      const childEntity = (_this$scene3 = this.scene) == null ? void 0 : _this$scene3.entityFromNative(nativeChildTransform.entity);

      if (childEntity) {
        orderedChildren.push(childEntity);
      } else {
        throw new Error('Entity has invalid child!');
      }
    }

    return orderedChildren;
  }

}

/**
 * @class
 * @category Core
 * @name Scene
 * @classdesc Scene Class to manage the scene graph hierarchy and all graphical objects.
 * @description Constructor to create an Scene instance.
 * @param {string} name - The name of the scene.
 * @sdk 9.8.0
 * @hideconstructor
 */

/**
 * @name Scene#root
 * @type {Entity}
 * @description Root entity of the scene.
 * @sdk 9.8.0
 */

class Scene {
  constructor(name) {
    this.entities = new Map();
    this._physicsSystem = undefined;

    if (name && name instanceof Amaz.Scene) {
      this.native = name;
      const entities = this.native.entities;
      const nativeRoot = entities.empty() ? undefined : this.findRoot(entities);

      if (nativeRoot) {
        this.root = this.entityFromNative(nativeRoot);
      } else {
        this.root = new Entity('Root', {
          scene: this
        });
      }
    } else {
      this.native = new Amaz.Scene();
      this.name = typeof name === 'string' ? name : 'Untitled';
      this.root = new Entity('Root', {
        scene: this
      });
    }

    Amaz.AmazingManager.addScene(this.native);
  }

  findRoot(entities) {
    let first = entities.front().getComponent('Transform');

    while (first.parent) {
      first = first.parent;
    }

    return first.entity;
  }
  /**
   * @name Scene#children
   * @type {Entity[]}
   * @description Scene's children.
   * @sdk 9.8.0
   */


  get children() {
    const orderedChildren = [];

    for (let i = 0; i < this.native.entities.size(); ++i) {
      const nativeChild = this.native.entities.get(i);
      const nativeChildTransform = nativeChild.getComponent('Transform');

      if (nativeChildTransform) {
        if (!nativeChildTransform.parent) {
          const childEntity = this.entityFromNative(nativeChild);

          if (childEntity) {
            orderedChildren.push(childEntity);
          } else {
            throw new Error('Scene has invalid child entity!');
          }
        }
      } else {
        throw new Error('Scene has invalid child entity!');
      }
    }

    return orderedChildren;
  }
  /**
   * @name Scene#name
   * @type {string}
   * @description Scene's name.
   * @sdk 9.8.0
   */


  get name() {
    return this.native.name;
  }

  set name(value) {
    this.native.name = value;
  }
  /**
   * @name Scene#visible
   * @type {boolean}
   * @description Scene's visible flag.
   * @sdk 9.8.0
   */


  get visible() {
    return this.native.visible;
  }

  set visible(value) {
    this.native.visible = value;
  }
  /**
   * @function
   * @name Scene#addSystem
   * @description Add system by name.
   * @param {string} name - Name of the system to add.
   * @sdk 9.8.0
   */


  addSystem(name) {
    this.native.addSystem(name);
  }
  /**
   * @function
   * @name Scene#addEntity
   * @description Add entity to scene.
   * @param {Entity} entity - Entity to add.
   * @sdk 9.8.0
   */


  addEntity(entity) {
    if (entity.native.handle) {
      this.entities.set(entity.native.handle, entity);
    }
  }
  /**
   * @function
   * @name Scene#removeEntity
   * @description Remove entity from scene.
   * @param {Entity} entity - Entity to remove.
   * @sdk 9.8.0
   */


  removeEntity(entity) {
    if (entity.native.handle) {
      this.entities.delete(entity.native.handle);
    }

    this.native.removeEntity(entity.native);
  }

  entityFromNative(native) {
    if (!native) {
      return undefined;
    }

    return native.handle && this.entities.has(native.handle) ? this.entities.get(native.handle) : Entity.fromNative(native, this);
  }
  /**
   * @function
   * @name Scene#destroy
   * @description Remove and clean up scene.
   * @sdk 9.8.0
   */


  destroy() {
    this.entities.clear();
    this.native.visible = false;
    Amaz.AmazingManager.removeScene(this.native);
  }
  /**
   * @function
   * @name Scene#rayCast
   * @description Raycast to find hit rigidbody entities in scene.
   * @param {Vec3} from - Start point of the ray.
   * @param {Vec3} to - End point of the ray.
   * @returns {Array<Entity>} List of hit entities.
   * @sdk 9.8.0
   */


  rayCast(from, to) {
    const hitEntities = [];
    const hits = this.physicsSystem.rayTest(from, to);

    for (let i = 0; i < hits.size(); ++i) {
      const component = hits.get(i);
      const entity = this.entityFromNative(component.entity);

      if (entity) {
        hitEntities.push(entity);
      }
    }

    return hitEntities;
  }
  /**
   * @function
   * @name Scene#findByName
   * @description Find child entity by name.
   * @param {string} name - Entity's name.
   * @returns {Entity} - Found entity.
   * @sdk 9.8.0
   */


  findByName(name) {
    let foundEntity = undefined;

    for (let i = 0; i < this.native.entities.size(); ++i) {
      const entity = this.entityFromNative(this.native.entities.get(i));

      if ((entity == null ? void 0 : entity.name) === name) {
        foundEntity = entity;
        break;
      }
    }

    return foundEntity;
  }
  /**
   * @function
   * @name Scene#findByTag
   * @description Find child entity by tag.
   * @param {number} tag - Entity's tag.
   * @returns {Entity} - Found entity.
   * @sdk 9.8.0
   */


  findByTag(tag) {
    let foundEntity = undefined;

    for (let i = 0; i < this.native.entities.size(); ++i) {
      const entity = this.entityFromNative(this.native.entities.get(i));

      if (entity != null && entity.findByTag(tag)) {
        foundEntity = entity;
        break;
      }
    }

    return foundEntity;
  }
  /**
   * @function
   * @name Scene#findAllByName
   * @description Find child entity by name.
   * @param {string} name - Entity's name.
   * @returns {Entity[]} - Found entities.
   * @sdk 9.8.0
   */


  findAllByName(name) {
    const entities = [];

    for (let i = 0; i < this.native.entities.size(); ++i) {
      const entity = this.entityFromNative(this.native.entities.get(i));

      if ((entity == null ? void 0 : entity.name) === name) {
        entities.push(entity);
      }
    }

    return entities;
  }
  /**
   * @function
   * @name Scene#findAllByTag
   * @description Find child entity by tag.
   * @param {number} tag - Entity's tag.
   * @returns {Entity[]} - Found entities.
   * @sdk 9.8.0
   */


  findAllByTag(tag) {
    const entities = [];

    for (let i = 0; i < this.native.entities.size(); ++i) {
      const entity = this.entityFromNative(this.native.entities.get(i));

      if (entity != null && entity.hasTag(tag)) {
        entities.push(entity);
      }
    }

    return entities;
  }

  get physicsSystem() {
    if (this._physicsSystem === undefined) {
      this._physicsSystem = this.native.getSystem('Physics3DSystem');
    }

    return this._physicsSystem;
  }

}

var TouchEventType;

(function (TouchEventType) {
  TouchEventType[TouchEventType["TouchStart"] = 0] = "TouchStart";
  TouchEventType[TouchEventType["TouchMove"] = 1] = "TouchMove";
  TouchEventType[TouchEventType["TouchStationary"] = 2] = "TouchStationary";
  TouchEventType[TouchEventType["TouchEnd"] = 3] = "TouchEnd";
  TouchEventType[TouchEventType["TouchCancel"] = 4] = "TouchCancel";
})(TouchEventType || (TouchEventType = {}));

class Touch {
  constructor(identifier, type, screenX, screenY, force, size, time, count) {
    this.identifier = -1;
    this.type = TouchEventType.TouchStart;
    this.x = 0;
    this.y = 0;
    this.force = 0;
    this.size = 0;
    this.time = 0;
    this.count = 0;
    this.valid = false;

    if (identifier !== undefined) {
      this.identifier = identifier;
      this.valid = true;
    }

    if (type !== undefined) {
      this.type = type;
    }

    if (screenX !== undefined) {
      this.x = screenX;
    }

    if (screenY !== undefined) {
      this.y = screenY;
    }

    if (force !== undefined) {
      this.force = force;
    }

    if (size !== undefined) {
      this.size = size;
    }

    if (time !== undefined) {
      this.time = time;
    }

    if (count !== undefined) {
      this.count = count;
    }
  }

  static fromNative(native) {
    const touch = new Touch(native.pointerId, Touch.convertTouchType(native.type), native.x, native.y, native.force, native.size, native.time, native.count);
    return touch;
  }

  static convertTouchType(type) {
    switch (type) {
      case Amaz.TouchType.TOUCH_BEGAN:
        return TouchEventType.TouchStart;

      case Amaz.TouchType.TOUCH_MOVED:
        return TouchEventType.TouchMove;

      case Amaz.TouchType.TOUCH_STATIONARY:
        return TouchEventType.TouchStationary;

      case Amaz.TouchType.TOUCH_ENDED:
        return TouchEventType.TouchEnd;

      case Amaz.TouchType.TOUCH_CANCELED:
        return TouchEventType.TouchCancel;

      default:
        return TouchEventType.TouchEnd;
    }
  }

}
/**
 * @class
 * @category Core
 * @name TouchDevice
 * @augments EventHandler
 * @classdesc TouchDevice class for touch input events from canvas element.
 * @description Constructor function to create the TouchDevice instance with canvas.
 * To add an TouchDevice to {@link Engine},
 * @param {HTMLCanvasElement} canvas - The entity.
 * @hideconstructor
 * @sdk 9.8.0
 */

/**
 * @event
 * @name TouchDevice#touchstart
 * @description Fired when touch input has started.
 * @param {TouchEvent} event - Touch event data.
 * @example
 * touch.on('touchstart', function (eventData) {
 *     console.log('Touch input has started');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name TouchDevice#touchmove
 * @description Fired when touch input is moving.
 * @param {TouchEvent} event - Touch event data.
 * @example
 * touch.on('touchmove', function (eventData) {
 *     console.log('Touch input is moving');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name TouchDevice#touchend
 * @description Fired when touch input has ended.
 * @param {TouchEvent} event - Touch event data.
 * @example
 * touch.on('touchend', function (eventData) {
 *     console.log('Touch input has ended');
 * });
 * @sdk 9.8.0
 */

/**
 * @event
 * @name TouchDevice#touchcancel
 * @description Fired when touch input was cancelled.
 * @param {TouchEvent} event - Touch event data.
 * @example
 * touch.on('touchcancel', function (eventData) {
 *     console.log('Touch input was cancelled');
 * });
 * @sdk 9.8.0
 */

class TouchDevice extends EventHandler {
  constructor(width, height) {
    super();
    this._width = width;
    this._height = height;
  }

  start() {
    return;
  }

  destroy() {
    return;
  }

  onEvent(event) {
    if (event.type === Amaz.EventType.TOUCH) {
      const nativeTouch = event.args.get(0);
      const touch = this.convertTouchEvent(nativeTouch);

      switch (touch.type) {
        case TouchEventType.TouchStart:
          this.fire('touchstart', touch);
          break;

        case TouchEventType.TouchMove:
          this.fire('touchmove', touch);
          break;

        case TouchEventType.TouchEnd:
          this.fire('touchend', touch);
          break;

        case TouchEventType.TouchCancel:
          this.fire('touchcancel', touch);
          break;
      }
    }
  }

  convertTouchEvent(event) {
    const x = Math.round(event.x * this._width);
    const y = this._height - Math.round(event.y * this._height); // invert the touch device y to match screen coordinates which uses bottom left as origin

    const newTouch = Touch.fromNative(event);
    newTouch.x = x;
    newTouch.y = y;
    return newTouch;
  }

}

class StringUtil {
  static toPascalCase(str) {
    if (!str) return str;
    return `${str}`.replace(new RegExp(/[-_]+/, 'g'), ' ').replace(new RegExp(/[^\w\s]/, 'g'), '').replace(new RegExp(/\s+(.)(\w*)/, 'g'), (_$1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`).replace(new RegExp(/\w/), s => s.toUpperCase());
  }

  static getFilename(uri) {
    return uri.substring(uri.lastIndexOf('/') + 1);
  }

}
class MeshUtil {
  /**
   * @ignore
   */
  static createQuadMesh() {
    // create Mesh
    const mesh = new Amaz.Mesh();
    const pos = new Amaz.VertexAttribDesc();
    pos.semantic = Amaz.VertexAttribType.POSITION;
    const uv = new Amaz.VertexAttribDesc();
    uv.semantic = Amaz.VertexAttribType.TEXCOORD0;
    const vads = new Amaz.Vector();
    vads.insert(0, pos);
    vads.insert(1, uv);
    mesh.vertexAttribs = vads;
    const minX = -1;
    const minY = -1;
    const maxX = 1;
    const maxY = 1;
    const vertexData = [maxX, maxY, 0.0, 1.0, 1.0, maxX, minY, 0.0, 1.0, 0.0, minX, minY, 0.0, 0.0, 0.0, minX, maxY, 0.0, 0.0, 1.0];
    const fv = new Amaz.FloatVector();

    for (let i = 0; i < vertexData.length; ++i) {
      fv.insert(i, vertexData[i]);
    }

    mesh.vertices = fv; // create SubMesh

    const subMesh = new Amaz.SubMesh();
    subMesh.primitive = Amaz.Primitive.TRIANGLES;
    const indexData = [0, 1, 2, 2, 3, 0];
    const indices = new Amaz.UInt16Vector();

    for (let i = 0; i < indexData.length; ++i) {
      indices.insert(i, indexData[i]);
    }

    subMesh.indices16 = indices;
    subMesh.mesh = mesh;
    mesh.addSubMesh(subMesh);
    return mesh;
  }

}
class RenderingUtil {
  /**
   * @param shaders
   * @param renderState
   * @ignore
   */
  static createShaderPass(shaders, renderState) {
    const pass = new Amaz.Pass();
    pass.shaders = shaders;
    const sem = new Amaz.Map();
    sem.insert('inPosition', Amaz.VertexAttribType.POSITION);
    sem.insert('inTexCoord', Amaz.VertexAttribType.TEXCOORD0);
    pass.semantics = sem;
    pass.renderState = renderState;
    return pass;
  }
  /**
   * @param shaders
   * @ignore
   */


  static createScreenMaterial(shaders) {
    const renderState = new Amaz.RenderState();
    renderState.viewport = new Amaz.ViewportState();
    renderState.viewport.rect = new Amaz.Rect(0, 0, 1, 1); // value int percentage by default

    renderState.viewport.minDepth = 0;
    renderState.viewport.maxDepth = 1;
    const pass = this.createShaderPass(shaders, renderState);
    return this.createMaterial(pass);
  }
  /**
   * @param pass
   * @ignore
   */


  static createMaterial(pass) {
    // xshader
    const xshader = new Amaz.XShader();
    xshader.passes.pushBack(pass); // material

    const material = new Amaz.Material();
    material.xshader = xshader;
    const props = new Amaz.PropertySheet();
    material.properties = props;
    return material;
  }
  /**
   * @ignore
   */


  static createRenderTexture() {
    const rt = new Amaz.RenderTexture();
    rt.depth = 1;
    rt.width = 640;
    rt.height = 360;
    rt.filterMag = Amaz.FilterMode.LINEAR;
    rt.filterMin = Amaz.FilterMode.LINEAR;
    rt.filterMipmap = Amaz.FilterMipmapMode.NONE;
    rt.attachment = Amaz.RenderTextureAttachment.NONE;
    return rt;
  }
  /**
   * @ignore
   */


  static createTexture2D() {
    const tex = new Amaz.Texture2D();
    tex.filterMin = Amaz.FilterMode.LINEAR;
    tex.filterMag = Amaz.FilterMode.LINEAR;
    return tex;
  }
  /**
   * @param vsSrc
   * @param psSrc
   * @ignore
   */


  static createShaders(vsSrc, psSrc) {
    const vs = new Amaz.Shader();
    vs.type = Amaz.ShaderType.VERTEX;
    vs.source = vsSrc;
    const ps = new Amaz.Shader();
    ps.type = Amaz.ShaderType.FRAGMENT;
    ps.source = psSrc;
    const shaders = new Amaz.Map();
    const shaderList = new Amaz.Vector();
    shaderList.insert(0, vs);
    shaderList.insert(1, ps);
    shaders.insert('gles2', shaderList);
    return shaders;
  }

}
class CmdBufferHelper {
  constructor() {
    this._screenMesh = MeshUtil.createQuadMesh();
    this._cmdBuffer = new Amaz.CommandBuffer();
    this._cmdBufferDirty = false;
  }

  onPreUpdate() {
    this._cmdBuffer.clearAll();
  }

  onPostUpdate() {
    var _Engine$engine;

    const scene = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.scene.native;

    if (scene && this._cmdBufferDirty) {
      scene.commitCommandBuffer(this._cmdBuffer);
      this._cmdBufferDirty = false;
    }
  }

  get screenMesh() {
    return this._screenMesh;
  }

  cmdBufferSetRenderTexture(target) {
    this._cmdBuffer.setRenderTexture(target);

    this._cmdBufferDirty = true;
  }

  cmdBufferClearRenderTexture(clearColor, clearDepth, backgroundColor, depth) {
    this._cmdBuffer.clearRenderTexture(clearColor, clearDepth, backgroundColor, depth);

    this._cmdBufferDirty = true;
  }

  cmdBufferDrawMesh(mesh, matrix, material, submeshIndex, shaderPass, properties) {
    this._cmdBuffer.drawMesh(mesh, matrix, material, submeshIndex, shaderPass, properties);

    this._cmdBufferDirty = true;
  }

}

class CamInputTextureAsset {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  constructor(config) {
    var _Engine$engine, _Engine$engine2;

    const properties = config.properties;
    this._flip = properties.flip;
    this._inputTexture = properties.inputTexture;
    this._renderTexture = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.customAssets.getNativeObject(config.uuid);
    this._renderTexture.depth = 1;
    this._renderTexture.filterMag = Amaz.FilterMode.LINEAR;
    this._renderTexture.filterMin = Amaz.FilterMode.LINEAR;
    this._renderTexture.filterMipmap = Amaz.FilterMipmapMode.NONE;
    this._renderTexture.attachment = Amaz.RenderTextureAttachment.NONE;
    this._renderTexture.width = Amaz.AmazingManager.getSingleton('BuiltinObject').getInputTextureWidth();
    this._renderTexture.height = Amaz.AmazingManager.getSingleton('BuiltinObject').getInputTextureHeight();
    const screenVs = `
    precision highp float;

    attribute vec3 inPosition;
    attribute vec2 inTexCoord;

    varying vec2 v_TexCoord;

    uniform mat4 u_Model;
    uniform float u_FlipVertical;

    void main() {
      vec2 flipCoord = vec2(inTexCoord.x, 1. - inTexCoord.y);
      v_TexCoord = mix(inTexCoord, flipCoord, u_FlipVertical);
      gl_Position = u_Model * vec4(inPosition, 1.0);
    }
    `;
    const screenFs = `
    precision highp float;

    varying vec2 v_TexCoord;

    uniform sampler2D u_CameraTex;

    void main() {
      gl_FragColor = texture2D(u_CameraTex, v_TexCoord);
    }
    `;
    const shaders = RenderingUtil.createShaders(screenVs, screenFs);
    this._screenMaterial = RenderingUtil.createScreenMaterial(shaders);
    const inputTexture = (_Engine$engine2 = Engine.engine) == null ? void 0 : _Engine$engine2.assets.loadSync(this._inputTexture);

    this._screenMaterial.setTex('u_CameraTex', inputTexture == null ? void 0 : inputTexture.resource);

    const flip = this._flip === true ? 1.0 : 0.0;

    this._screenMaterial.setFloat('u_FlipVertical', flip);
  }

  onStart() {// empty
  }

  onUpdate() {
    const cmdBufHelper = Engine.engine.customAssets.cmdBufferHelper;
    cmdBufHelper.cmdBufferSetRenderTexture(this._renderTexture);
    cmdBufHelper.cmdBufferDrawMesh(cmdBufHelper.screenMesh, new Mat4(), this._screenMaterial, 0, 0, new Amaz.MaterialPropertyBlock());
  }

  onLateUpdate() {
    return;
  }

  onDestroy() {
    return;
  }

  get type() {
    return exports.AssetSubType.CameraInput;
  }

}

/**
 * @class
 * @category Algorithm
 * @name Head
 * @classdesc A Head class provides capabilities for head tracking,
 * expression recognition, 2D keypoint tracking, 3D keypoint tracking, etc.
 * @description Constructor to create a Head instance.
 * @augments EventHandler
 * @sdk 9.8.0
 */

/**
 * @event Head#detected
 * @description Fire when a head is detected.
 * @param {number} id - ID of the detected head.
 * @example
 * // use event enum
 * amg.Head.on(amg.FaceEvent.Detected, function(id){
 *   console.log("Start tracking head: " + id);
 * })
 *
 * // use event string
 * amg.Head.on('detected', function(id){
 *   console.log("Start tracking head: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event Head#lost
 * @description Fire when a head lose tracking state.
 * @param {number} id - ID of the head which lose tracking.
 * @example
 * // use event enum
 * amg.Head.on(amg.FaceEvent.Lost, function(id){
 *   console.log("Lose tracking head: " + id);
 * })
 *
 * // use event string
 * amg.Head.on('lost', function(id){
 *   console.log("Lose tracking head: " + id);
 * })
 * @sdk 9.8.0
 */

class Head extends EventHandler {
  /**
   * @name Head#faces
   * @type {FaceData[]}
   * @description The {@link FaceData} array with maximum 5 heads supported. heads[0] is the first face the algorithm detected.
   */
  constructor() {
    super();
    this.faces = new Array();
    this._faceProvider = new FaceInfoProvider(this);
    this.hasFaceMap = new Map();
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Head();
    }

    return this._instance;
  }
  /**
   * @function
   * @name Head.getLandmark
   * @description Get the landmarks of the specific face.
   * @param {FacePart} type
   * @param {number} id
   * @param {FaceLandmarkType} option
   * @returns {Vec2Vector | Vec3Vector} The 2d or 3d landmarks of the specific face.
   * @static
   */


  static getLandmark(type, id, option) {
    return this.getInstance().getLandmarks(type, id, option);
  }

  getLandmarks(type, id, option) {
    if (this._faceProvider) {
      return this._faceProvider.getLandmark(type, id, option);
    }
  }

  onUpdate() {
    this._faceProvider.onUpdate();
  }

  init() {
    return;
  }

  static get faces() {
    return this.getInstance().faces;
  }
  /**
   * @function
   * @name Head.on
   * @type {EventHandler}
   * @description Attach an event handler to an event with the specified name.
   * @param {FaceEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static on(event, callback, scope) {
    return this.getInstance().on(event, callback, scope);
  }
  /**
   * @function
   * @name Head.off
   * @type {EventHandler}
   * @description Detach an event with a specific name, if there is no name provided, all the events are detached.
   * @param {FaceEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static off(event, callback, scope) {
    return this.getInstance().off(event, callback, scope);
  }

  setFaceState(hasFace, id) {
    if (!this.hasFaceMap.has(id)) {
      this.hasFaceMap.set(id, false);
    }

    if (this.hasFaceMap.get(id) !== hasFace) {
      if (hasFace === true) {
        this.fire(exports.FaceEvent.Detected, id);
      } else {
        this.fire(exports.FaceEvent.Lost, id);
      }

      this.hasFaceMap.set(id, hasFace);
    }
  }

}
/**
 * @class
 * @category Algorithm
 * @name FaceMeshInfo
 * @classdesc A FaceMeshInfo class stores 3d head algorithm result including 3d vertexes, 3d landmarks, 3d normals, 3d tangents, 3d mvp, 3d modelMatrix and face 3d scale.
 * @description Constructor to create a new FaceMeshInfo instance.
 */

class FaceMeshInfo {
  /**
   * @name FaceMeshInfo#vertexes
   * @description The 3d vertexs of the tracked face.
   * @type {Vec3Vector}
   * @readonly
   */

  /**
   * @name FaceMeshInfo#normals
   * @description The 3d normals of the tracked face.
   * @type {Vec3Vector}
   * @readonly
   */

  /**
   * @name FaceMeshInfo#tangents
   * @description The 3d tangents of the tracked face.
   * @type {Vec3Vector}
   * @readonly
   */

  /**
   * @name FaceMeshInfo#mvp
   * @description The 3d mvp of the tracked face.
   * @type {Mat4}
   * @readonly
   */

  /**
   * @name FaceMeshInfo#modelMatrix
   * @description The 3d modelMatrix of the tracked face.
   * @type {Mat4}
   * @readonly
   */

  /**
   * @name FaceMeshInfo#scale
   * @description The scale of the 3d tracked face.
   * @type {number}
   * @readonly
   */
  constructor() {
    this.vertexes = new Amaz.Vec3Vector();
    this.landmarks = new Amaz.Vec3Vector();
    this.normals = new Amaz.Vec3Vector();
    this.tangents = new Amaz.Vec3Vector();
    this.mvp = new Mat4();
    this.modelMatrix = new Mat4();
    this.scale = 0;
  }

}
/**
 * @class
 * @category Algorithm
 * @name FaceData
 * @classdesc A FaceData class stores head algorithm result including credibility score, transform, face id, yaw, pitch, roll, face rect and expression.
 * @description Constructor to create a new FaceData instance.
 */


class FaceData {
  /**
   * @name FaceData#id
   * @description The tracked face ID.
   * @type {number}
   * @readonly
   */

  /**
   * @name FaceData#score
   * @description Get credibility score for face detection, in the range of [0,1].
   * @type {number}
   * @readonly
   */

  /**
   * @name FaceData#transform
   * @description Face transform of the tracked face.
   * @type {Matrix4x4f}
   * @readonly
   */

  /**
   * @name FaceData#yaw
   * @description The yaw of the tracked face. (Radius)
   * @type {number}
   * @readonly
   */

  /**
   * @name FaceData#pitch
   * @description The pitch of the tracked face. (Radius)
   * @type {number}
   * @readonly
   */

  /**
   * @name FaceData#roll
   * @description The roll of the tracked face. (Radius)
   * @type {number}
   * @readonly
   */

  /**
   * @name FaceData#rect
   * @description The rectangle of the tracked face.
   * @type {Rect}
   * @readonly
   */

  /**
   * @name FaceData#expression
   * @description Get expression of the tracked face.
   * @type {FaceExpression}
   * @readonly
   */
  constructor() {
    this.score = 0;
    this.id = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.transform = new Mat4();
    this.rect = new Amaz.Rect();
    this.expression = exports.FaceExpression.Unknown;
    this.isValidFace = false;
    this.action = exports.FaceAction.None;
    this.faceMesh = new FaceMeshInfo();
    this.landmarks106 = new Amaz.Vec2Vector();
    this.landmarks240EyeLeft = new Amaz.Vec2Vector();
    this.landmarks240EyeRight = new Amaz.Vec2Vector();
    this.landmarks240EyebrowLeft = new Amaz.Vec2Vector();
    this.landmarks240EyebrowRight = new Amaz.Vec2Vector();
    this.landmarks240Lip = new Amaz.Vec2Vector();
    this.landmarks280LeftIris = new Amaz.Vec2Vector();
    this.landmarks280RightIris = new Amaz.Vec2Vector();
    this.landmarks3d = new Amaz.Vec3Vector();
  }
  /**
   * @function
   * @name FaceData.isValid
   * @returns {boolean}
   * @description Check if the face data is valid or not.
   * @static
   */


  isValid() {
    return this.isValidFace;
  }
  /**
   * @function
   * @name FaceData.hasAction
   * @returns {boolean}
   * @description Check if there is any action of the tracked face.
   * @static
   */


  hasAction() {
    return this.action !== exports.FaceAction.None;
  }

}

class FaceInfoProvider {
  constructor(mgr) {
    this._mgr = mgr;
    this.lastFaceIdSet = new Set();
  }

  facePartHelper(start, end, wholeLandmarks, partLandmarks) {
    for (let i = start; i < end; i++) {
      partLandmarks.pushBack(wholeLandmarks.get(i));
    }

    return partLandmarks;
  }

  getLandmark(type, id, option) {
    switch (option) {
      case exports.FaceLandmarkType.Face106:
        return this.get106landmark(type, id);

      case exports.FaceLandmarkType.Face240:
        return this.get240landmark(type, id);

      case exports.FaceLandmarkType.Face280:
        return this.get280landmark(type, id);

      case exports.FaceLandmarkType.Face3d:
        return this.get3dlandmark(type, id);

      default:
        console.error(`Head doesn't support ${option} yet`);
        return null;
    }
  }

  get106landmark(type, id) {
    switch (type) {
      case exports.FacePart.Whole:
        return this._mgr.faces[id].landmarks106;

      case exports.FacePart.LeftEye:
        let leftEye = new Amaz.Vec2Vector();
        leftEye = this.facePartHelper(52, 58, this._mgr.faces[id].landmarks106, leftEye);
        leftEye = this.facePartHelper(72, 74, this._mgr.faces[id].landmarks106, leftEye);
        leftEye = this.facePartHelper(104, 105, this._mgr.faces[id].landmarks106, leftEye);
        return leftEye;

      case exports.FacePart.RightEye:
        let rightEye = new Amaz.Vec2Vector();
        rightEye = this.facePartHelper(58, 64, this._mgr.faces[id].landmarks106, rightEye);
        rightEye = this.facePartHelper(75, 78, this._mgr.faces[id].landmarks106, rightEye);
        rightEye = this.facePartHelper(105, 106, this._mgr.faces[id].landmarks106, rightEye);
        return rightEye;

      case exports.FacePart.Nose:
        let nose = new Amaz.Vec2Vector();
        nose = this.facePartHelper(43, 52, this._mgr.faces[id].landmarks106, nose);
        nose = this.facePartHelper(80, 84, this._mgr.faces[id].landmarks106, nose);
        return nose;

      case exports.FacePart.Mouth:
        let mouth = new Amaz.Vec2Vector();
        mouth = this.facePartHelper(84, 104, this._mgr.faces[id].landmarks106, mouth);
        return mouth;

      case exports.FacePart.LeftEyeBrow:
        let leftEyeBrow = new Amaz.Vec2Vector();
        leftEyeBrow = this.facePartHelper(33, 38, this._mgr.faces[id].landmarks106, leftEyeBrow);
        leftEyeBrow = this.facePartHelper(64, 68, this._mgr.faces[id].landmarks106, leftEyeBrow);
        return leftEyeBrow;

      case exports.FacePart.RightEyeBrow:
        let rightEyeBrow = new Amaz.Vec2Vector();
        rightEyeBrow = this.facePartHelper(38, 43, this._mgr.faces[id].landmarks106, rightEyeBrow);
        rightEyeBrow = this.facePartHelper(68, 72, this._mgr.faces[id].landmarks106, rightEyeBrow);
        return rightEyeBrow;

      default:
        console.error(`Head 106 doesn't support ${type} yet`);
        return null;
    }
  }

  get240landmark(type, id) {
    switch (type) {
      case exports.FacePart.Whole:
        let whole = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyeLeft.size(), this._mgr.faces[id].landmarks240EyeLeft, this._mgr.faces[id].landmarks106);
        whole = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyeRight.size(), this._mgr.faces[id].landmarks240EyeRight, whole);
        whole = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyebrowLeft.size(), this._mgr.faces[id].landmarks240EyebrowLeft, whole);
        whole = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyebrowRight.size(), this._mgr.faces[id].landmarks240EyebrowRight, whole);
        whole = this.facePartHelper(0, this._mgr.faces[id].landmarks240Lip.size(), this._mgr.faces[id].landmarks240Lip, whole);
        return whole;

      case exports.FacePart.LeftEye:
        const leftEye106 = this._mgr.getLandmarks(exports.FacePart.LeftEye, id, exports.FaceLandmarkType.Face106);

        const leftEye = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyeLeft.size(), this._mgr.faces[id].landmarks240EyeLeft, leftEye106);
        return leftEye;

      case exports.FacePart.RightEye:
        const rightEye106 = this._mgr.getLandmarks(exports.FacePart.RightEye, id, exports.FaceLandmarkType.Face106);

        const rightEye = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyeRight.size(), this._mgr.faces[id].landmarks240EyeRight, rightEye106);
        return rightEye;

      case exports.FacePart.Nose:
        const nose106 = this._mgr.getLandmarks(exports.FacePart.Nose, id, exports.FaceLandmarkType.Face106);

        return nose106;

      case exports.FacePart.Mouth:
        const mouth106 = this._mgr.getLandmarks(exports.FacePart.Mouth, id, exports.FaceLandmarkType.Face106);

        const mouth = this.facePartHelper(0, this._mgr.faces[id].landmarks240Lip.size(), this._mgr.faces[id].landmarks240Lip, mouth106);
        return mouth;

      case exports.FacePart.LeftEyeBrow:
        const leftEyeBrow106 = this._mgr.getLandmarks(exports.FacePart.LeftEyeBrow, id, exports.FaceLandmarkType.Face106);

        const leftEyeBrow = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyebrowLeft.size(), this._mgr.faces[id].landmarks240EyebrowLeft, leftEyeBrow106);
        return leftEyeBrow;

      case exports.FacePart.RightEyeBrow:
        const rightEyeBrow106 = this._mgr.getLandmarks(exports.FacePart.RightEyeBrow, id, exports.FaceLandmarkType.Face106);

        const rightEyeBrow = this.facePartHelper(0, this._mgr.faces[id].landmarks240EyebrowRight.size(), this._mgr.faces[id].landmarks240EyebrowRight, rightEyeBrow106);
        return rightEyeBrow;

      default:
        console.error(`Head 240 doesn't support ${type} yet`);
        return null;
    }
  }

  get280landmark(type, id) {
    switch (type) {
      case exports.FacePart.Whole:
        const whole240 = this._mgr.getLandmarks(exports.FacePart.Whole, id, exports.FaceLandmarkType.Face240);

        let whole = this.facePartHelper(0, this._mgr.faces[id].landmarks280LeftIris.size(), this._mgr.faces[id].landmarks280LeftIris, whole240);
        whole = this.facePartHelper(0, this._mgr.faces[id].landmarks280RightIris.size(), this._mgr.faces[id].landmarks280RightIris, whole);
        return whole;

      case exports.FacePart.LeftEye:
        const leftEye240 = this._mgr.getLandmarks(exports.FacePart.LeftEye, id, exports.FaceLandmarkType.Face240);

        const leftEye = this.facePartHelper(0, this._mgr.faces[id].landmarks280LeftIris.size(), this._mgr.faces[id].landmarks280LeftIris, leftEye240);
        return leftEye;

      case exports.FacePart.RightEye:
        const rightEye240 = this._mgr.getLandmarks(exports.FacePart.RightEye, id, exports.FaceLandmarkType.Face240);

        const rightEye = this.facePartHelper(0, this._mgr.faces[id].landmarks280RightIris.size(), this._mgr.faces[id].landmarks280RightIris, rightEye240);
        return rightEye;

      case exports.FacePart.Nose:
        const nose240 = this._mgr.getLandmarks(exports.FacePart.Nose, id, exports.FaceLandmarkType.Face240);

        return nose240;

      case exports.FacePart.Mouth:
        const mouth240 = this._mgr.getLandmarks(exports.FacePart.Mouth, id, exports.FaceLandmarkType.Face240);

        return mouth240;

      case exports.FacePart.LeftEyeBrow:
        const leftEyeBrow240 = this._mgr.getLandmarks(exports.FacePart.LeftEyeBrow, id, exports.FaceLandmarkType.Face240);

        return leftEyeBrow240;

      case exports.FacePart.RightEyeBrow:
        const rightEyeBrow240 = this._mgr.getLandmarks(exports.FacePart.RightEyeBrow, id, exports.FaceLandmarkType.Face240);

        return rightEyeBrow240;

      default:
        console.error(`Head 280 doesn't support ${type} yet`);
        return null;
    }
  }

  get3dlandmark(type, id) {
    switch (type) {
      case exports.FacePart.Whole:
        return this._mgr.faces[id].landmarks3d;

      default:
        console.error(`Head 3d doesn't support ${type} yet`);
        return null;
    }
  }

  onUpdate() {
    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult();
    const faceCount = algResult.getFaceCount();
    this._mgr.faces = new Array(faceCount);
    const faceIdSet = new Set();

    if (faceCount > 0) {
      for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
        const faceData = algResult.getFaceBaseInfo(faceIndex);
        const faceAttrData = algResult.getFaceAttributeInfo(faceIndex);
        const faceExtraData = algResult.getFaceExtraInfo(faceIndex);
        const faceMeshData = algResult.getFaceMeshInfo(faceIndex);
        const faceInfo = new FaceData();
        this._mgr.faces[faceIndex] = faceInfo;

        if (faceData != null) {
          this._mgr.setFaceState(true, faceData.ID);

          faceIdSet.add(faceData.ID);
          faceInfo.isValidFace = true;
          faceInfo.score = faceData.score;
          faceInfo.id = faceData.ID;
          faceInfo.yaw = faceData.yaw;
          faceInfo.pitch = faceData.pitch;
          faceInfo.roll = faceData.roll;
          faceInfo.rect = faceData.rect;
          faceInfo.action = faceData.action;
          faceInfo.landmarks106 = faceData.points_array;
        }

        if (faceExtraData != null) {
          faceInfo.landmarks240EyeLeft = faceExtraData.eye_left;
          faceInfo.landmarks240EyeRight = faceExtraData.eye_right;
          faceInfo.landmarks240EyebrowLeft = faceExtraData.eyebrow_left;
          faceInfo.landmarks240EyebrowRight = faceExtraData.eyebrow_right;
          faceInfo.landmarks240Lip = faceExtraData.lips;
          faceInfo.landmarks280LeftIris = faceExtraData.left_iris;
          faceInfo.landmarks280RightIris = faceExtraData.right_iris;
        }

        if (faceAttrData != null) {
          faceInfo.expression = faceAttrData.exp_type;
        }

        if (faceMeshData != null) {
          faceInfo.landmarks3d = faceMeshData.landmarks;
          faceInfo.faceMesh.vertexes = faceMeshData.vertexes;
          faceInfo.faceMesh.normals = faceMeshData.normals;
          faceInfo.faceMesh.tangents = faceMeshData.tangents;
          faceInfo.faceMesh.scale = faceMeshData.scale;
          faceInfo.faceMesh.mvp = faceMeshData.mvp;
          faceInfo.faceMesh.modelMatrix = faceMeshData.modelMatrix;
        }
      }

      for (const faceID of this.lastFaceIdSet.values()) {
        if (!faceIdSet.has(faceID)) {
          this._mgr.setFaceState(false, faceID);
        }
      }

      this.lastFaceIdSet.clear();
      faceIdSet.forEach(value => this.lastFaceIdSet.add(value));
    } else {
      this.lastFaceIdSet.forEach(faceID => this._mgr.setFaceState(false, faceID));
      this.lastFaceIdSet.clear();
    }
  }

}

/* eslint-disable @typescript-eslint/no-explicit-any */

class FaceTextureAsset {
  constructor(config) {
    var _Engine$engine, _Engine$engine$assets, _Engine$engine$assets2;

    const properties = config.properties;
    this._initialized = false;
    this._faceIndex = properties.faceIndex; // which face to do the texture sampling

    this._textureResScale = properties.textureResScale; // scale factor to resize the face texture resolution

    this._meshPath = properties.meshPath; // face mesh path

    this._materialPath = properties.materialPath; // face material path

    this._renderTexture = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.customAssets.getNativeObject(config.uuid);
    this._renderTexture.depth = 1;
    this._renderTexture.width = 640;
    this._renderTexture.height = 360;
    this._renderTexture.filterMag = Amaz.FilterMode.LINEAR;
    this._renderTexture.filterMin = Amaz.FilterMode.LINEAR;
    this._renderTexture.filterMipmap = Amaz.FilterMipmapMode.NONE;
    this._renderTexture.attachment = Amaz.RenderTextureAttachment.NONE; // scale up the face texture resolution
    // this helps to reduce the visual quality artifacts of the face texture rendering

    this._renderTexture.width = Amaz.AmazingManager.getSingleton('BuiltinObject').getOutputTextureWidth() * this._textureResScale;
    this._renderTexture.height = Amaz.AmazingManager.getSingleton('BuiltinObject').getOutputTextureHeight() * this._textureResScale;
    this._faceMaterial = (_Engine$engine$assets = Engine.engine.assets.loadSync(this._materialPath)) == null ? void 0 : _Engine$engine$assets.resource.native;
    this._faceMesh = (_Engine$engine$assets2 = Engine.engine.assets.loadSync(this._meshPath)) == null ? void 0 : _Engine$engine$assets2.resource;
  }

  onStart() {// empty
  }

  onLateUpdate() {
    return;
  }

  onDestroy() {
    return;
  }

  onUpdate() {
    const cmdBufHelper = Engine.engine.customAssets.cmdBufferHelper;

    if (!this._initialized) {
      // clear the render texture at the beginning
      cmdBufHelper.cmdBufferSetRenderTexture(this._renderTexture);
      cmdBufHelper.cmdBufferClearRenderTexture(true, true, new Amaz.Color(0.0, 0.0, 0.0, 0.0), 0.0);
      this._initialized = true;
    }

    if (this._faceMesh != null && this._faceMaterial != null) {
      const faces = Head.faces;
      const faceCount = faces.length;

      if (faceCount <= this._faceIndex) {
        return;
      }

      const faceMeshInfo = faces[this._faceIndex].faceMesh;

      if (faceMeshInfo === null) {
        return;
      }

      const oriPos = faceMeshInfo.vertexes;
      const oriNormals = faceMeshInfo.normals;

      if (oriPos != null && oriNormals != null && 0 < oriPos.size() && 0 < oriNormals.size()) {
        this._faceMaterial.setMat4('u_MVP', faceMeshInfo.mvp); //facefitting algorithm updates the mesh to sample face texture


        this._faceMesh.setVertexArray(oriPos);

        this._faceMesh.setNormalArray(oriNormals);
      } // render with face material


      const identityMat = new Mat4();
      identityMat.setIdentity();
      cmdBufHelper.cmdBufferSetRenderTexture(this._renderTexture);
      cmdBufHelper.cmdBufferDrawMesh(this._faceMesh, identityMat, this._faceMaterial, 0, 0, new Amaz.MaterialPropertyBlock());
    } else {
      if (this._faceMesh == null) {
        console.error('face texture asset: mesh not found!');
      }

      if (this._faceMaterial == null) {
        console.error('face texture asset: material not found!');
      }
    }
  }

  get type() {
    return exports.AssetSubType.Face;
  }

}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @class
 * @category Algorithm
 * @name Segmentation
 * @classdesc Segmentation textures are images which can be used as masks to show or hide certain areas of an input image.
 * @description Create a Segmentation.
 * @augments EventHandler
 * @example
 * //head segmentation creates a masked image of the head of user.
 * let headMask = amg.Segmentation.getMask(amg.SegmentationType.Head)
 * @sdk 9.8.0
 */

class Segmentation {
  constructor() {
    this._segProviderMap = new Map();
    this._cmdBufferHelper = new CmdBufferHelper();
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Segmentation();
    }

    return this._instance;
  }
  /**
   * @function
   * @name Segmentation#getMask
   * @description Get the full-screen grey-scale mask texture.
   * @param {SegmentationType} type - The type of segmentation algorithm.
   * @param {number} id - Context-based id.
   * @returns {Texture | RenderTexture} Texture that contains mask information.
   * @readonly
   * @static
   */


  static getMask(type, id = 0) {
    return this.getInstance().getMask(type, id);
  }

  init() {
    // TODO: only enable algorithms included in algorithm.json.
    // Need API support from engine or editor
    this._segProviderMap.set(exports.SegmentationType.Body.toLowerCase(), new BodySegProvider(this));

    this._segProviderMap.set(exports.SegmentationType.Head.toLowerCase(), new HeadSegProvider(this));

    this._segProviderMap.set(exports.SegmentationType.Sky.toLowerCase(), new SkySegProvider(this));

    this._segProviderMap.set(exports.SegmentationType.Hair.toLowerCase(), new HairSegProvider(this));

    this._segProviderMap.set(exports.SegmentationType.Building.toLowerCase(), new BuildingSegProvider(this));

    this._segProviderMap.set(exports.SegmentationType.Cloth.toLowerCase(), new ClothSegProvider(this));

    this._segProviderMap.set(exports.SegmentationType.Ground.toLowerCase(), new GroundSegProvider(this));
  }

  get cmdBufferHelper() {
    return this._cmdBufferHelper;
  }

  onUpdate(dt) {
    this._cmdBufferHelper.onPreUpdate();

    for (const provider of this._segProviderMap.values()) {
      provider.onUpdate(dt);
    }

    this._cmdBufferHelper.onPostUpdate();
  }

  createRenderTextureHelper(shaders) {
    return new RenderTextureHelper(RenderingUtil.createTexture2D(), RenderingUtil.createRenderTexture(), RenderingUtil.createScreenMaterial(shaders));
  }

  createNomralScreenShader() {
    const screenVs = `attribute vec3 inPosition;
       attribute vec2 inTexCoord;
       varying vec2 uv;
       uniform mat4 u_Model;
       void main() {
       gl_Position = u_Model * vec4(inPosition, 1.0);
       uv = inTexCoord;
       }
      `;
    const screenPs = `precision lowp float;
       varying vec2 uv;
       uniform sampler2D tex;
       void main() {
        gl_FragColor = texture2D(tex, uv);
      }
      `;
    return RenderingUtil.createShaders(screenVs, screenPs);
  }

  getMask(type, id) {
    const provider = this._segProviderMap.get(type.toLowerCase());

    if (provider) {
      return provider.getMask(id);
    } else {
      console.error(`Segmentation doesn't support ${type} yet`);
      return null;
    }
  }

}

class RenderTextureHelper {
  constructor(texture, renderTexture, screenMateria) {
    this.texture = texture;
    this.renderTexture = renderTexture;
    this.screenMaterial = screenMateria;
  }

}

class SegProvider {
  constructor(mgr) {
    this._mgr = mgr;
  }

}

class BodySegProvider extends SegProvider {
  onUpdate() {// empty
  }

  getMask() {
    return Amaz.AmazingManager.getSingleton('BuiltinObject').getBuiltinTexture(Amaz.BuiltInTextureType.BG);
  }

}

class SkySegProvider extends SegProvider {
  onUpdate() {// empty
  }

  getMask() {
    return Amaz.AmazingManager.getSingleton('BuiltinObject').getBuiltinTexture(Amaz.BuiltInTextureType.SKYSEGMASK);
  }

}

class ClothSegProvider extends SegProvider {
  onUpdate() {// empty
  }

  getMask() {
    return Amaz.AmazingManager.getSingleton('BuiltinObject').getBuiltinTexture(Amaz.BuiltInTextureType.CLOTHES);
  }

}

class BuildingSegProvider extends SegProvider {
  constructor() {
    super(...arguments);
    this._initialized = false;
  }

  onUpdate() {
    if (!this._initialized) {
      return;
    }

    const texture = Amaz.AmazingManager.getSingleton('BuiltinObject').getBuiltinTexture(Amaz.BuiltInTextureType.BUILDING);

    this._screenMaterial.setTex('tex', texture);

    this._mgr.cmdBufferHelper.cmdBufferSetRenderTexture(this._renderTexture);

    this._mgr.cmdBufferHelper.cmdBufferDrawMesh(this._mgr.cmdBufferHelper.screenMesh, new Mat4(), this._screenMaterial, 0, 0, new Amaz.MaterialPropertyBlock());
  }

  getMask() {
    this.tryToInit();
    return this._renderTexture;
  }

  tryToInit() {
    if (this._initialized) {
      return;
    }

    this._initialized = true;
    this._renderTexture = RenderingUtil.createRenderTexture();
    const screenVs = `attribute vec3 inPosition;
      attribute vec2 inTexCoord;
      varying vec2 uv; 
      uniform mat4 u_Model;
      void main() {
        gl_Position = u_Model * vec4(inPosition, 1.0);
        uv = inTexCoord;
      }
      `;
    const screenPs = `precision lowp float;
      varying vec2 uv;
      uniform sampler2D tex;
      void main() {
        vec4 color = texture2D(tex, uv);
        gl_FragColor = vec4(color.g, color.g, color.g, 1.0);
      } 
      `;
    const shaders = RenderingUtil.createShaders(screenVs, screenPs);
    this._screenMaterial = RenderingUtil.createScreenMaterial(shaders);
  }

}

class GroundSegProvider extends SegProvider {
  onUpdate() {// empty
  }

  getMask() {
    return Amaz.AmazingManager.getSingleton('BuiltinObject').getBuiltinTexture(Amaz.BuiltInTextureType.GROUND);
  }

}

class HairSegProvider extends SegProvider {
  onUpdate() {
    // TODO: only updates when user has called getMask
    // remove when we can detect enabled alogorithms in script
    if (this._texture == null) {
      return;
    }

    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const hairInfo = algMgr.getAEAlgorithmResult().getHairInfo();
    const texture = this.getOrCreateTexture();

    if (hairInfo == null) {
      texture.storage(new Amaz.Image());
    } else {
      texture.storage(hairInfo.mask);
    }
  }

  getOrCreateTexture() {
    if (this._texture == null) {
      this._texture = new Amaz.Texture2D();
    }

    return this._texture;
  }

  getMask() {
    return this.getOrCreateTexture();
  }

}

class HeadSegProvider extends SegProvider {
  constructor(mgr) {
    super(mgr);
    this._rdMap = new Map();
  }

  onUpdate() {
    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult();

    for (let i = 0; i < algResult.getHeadSegInfoCount(); ++i) {
      this.getOrCreateRnderTextureHelper(i);
    }

    for (const id of this._rdMap.keys()) {
      this.updateMask(algResult.getHeadSegInfo(id), this._rdMap.get(id));
    }
  }

  getMask(id) {
    var _this$getOrCreateRnde;

    return (_this$getOrCreateRnde = this.getOrCreateRnderTextureHelper(id)) == null ? void 0 : _this$getOrCreateRnde.renderTexture;
  }

  getOrCreateRnderTextureHelper(id) {
    if (!this._rdMap.has(id)) {
      this._rdMap.set(id, this._mgr.createRenderTextureHelper(this._mgr.createNomralScreenShader()));
    }

    return this._rdMap.get(id);
  }

  updateMask(headSegInfo, helper) {
    if (helper == null) {
      return;
    } // Final matrix is combined with postTransform * headSeg_mat4' * preTransform.


    const MVP = new Mat4();

    this._mgr.cmdBufferHelper.cmdBufferSetRenderTexture(helper.renderTexture);

    this._mgr.cmdBufferHelper.cmdBufferClearRenderTexture(true, false, new Amaz.Color(0.0, 0.0, 0.0, 0.0), 1.0);

    if (headSegInfo != null) {
      helper.texture.storage(headSegInfo.alpha);
      const mask_w = headSegInfo.width;
      const mask_h = headSegInfo.height;
      const src_w = headSegInfo.srcWidth;
      const src_h = headSegInfo.srcHeight; //HeadSegInfo.matrix represents a reduced(only first 2 rows) row-major 3x3 matrix.

      const matrix_vector = headSegInfo.matrix;
      const m00 = matrix_vector.get(0);
      const m01 = matrix_vector.get(1);
      const m02 = matrix_vector.get(2);
      const m10 = matrix_vector.get(3);
      const m11 = matrix_vector.get(4);
      const m12 = matrix_vector.get(5); // Initialize a Matrix4x4f in column-major order.

      const headseg_mat4 = new Mat4(m00, m10, 0.0, 0.0, m01, m11, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, m02, m12, 0.0, 1.0); // The matrix is the transform from source(blitted) image to cropped image, so we need to inverse it.

      headseg_mat4.invert_Full(); // 1st step. Transform normalized quad vertices(from -1 to +1) into coordinates in cropped image.

      const preTransform = new Mat4(mask_w / 2.0, 0, 0, 0, 0, mask_h / 2.0, 0, 0, 0, 0, 1, 0, mask_w / 2.0, mask_h / 2, 0, 1); // 2nd step. Map coordinates in cropped image into source(blitted) image with inversed algorithm output matrix.
      //headseg_mat4.multiplyMatrices4x4(preTransform,headseg_mat4, mat0)

      const mat0 = new Mat4();
      Mat4.multiplyMatrices4x4(headseg_mat4, preTransform, mat0); // 3rd step. Transform coordinates in source(blitted) image into normalized coordinates in the range of (-1, +1) for final OpenGL rendering.

      const postTransform = new Mat4(2.0 / src_w, 0, 0, 0, 0, 2.0 / src_h, 0, 0, 0, 0, 1, 0, -1, -1, 0, 1);
      Mat4.multiplyMatrices4x4(postTransform, mat0, MVP);
      helper.screenMaterial.setTex('tex', helper.texture);

      this._mgr.cmdBufferHelper.cmdBufferDrawMesh(this._mgr.cmdBufferHelper.screenMesh, MVP, helper.screenMaterial, 0, 0, new Amaz.MaterialPropertyBlock());
    }
  }

}

class SegTextureAsset {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  constructor(config) {
    var _Engine$engine;

    const properties = config.properties;
    this._segType = properties.segmentationType.toLowerCase();
    this._smoothness = properties.smoothness;
    this._invert = properties.invert;
    this._useCutoutTexture = properties.useCutoutTexture;
    this._cutoutTexture = properties.cutoutTexture;
    this._cutoutTexutureInverseY = properties.cutoutTextureInverseY;
    this._renderTexture = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.customAssets.getNativeObject(config.uuid);
    this._renderTexture.depth = 1;
    this._renderTexture.width = Amaz.AmazingManager.getSingleton('BuiltinObject').getInputTextureWidth();
    this._renderTexture.height = Amaz.AmazingManager.getSingleton('BuiltinObject').getInputTextureHeight();
    this._renderTexture.filterMag = Amaz.FilterMode.LINEAR;
    this._renderTexture.filterMin = Amaz.FilterMode.LINEAR;
    this._renderTexture.filterMipmap = Amaz.FilterMipmapMode.NONE;
    this._renderTexture.attachment = Amaz.RenderTextureAttachment.NONE;
    const screenVs = `attribute vec3 inPosition;
    attribute vec2 inTexCoord;
    varying vec2 uv;
    uniform mat4 u_Model;
    void main() {
      gl_Position = u_Model * vec4(inPosition, 1.0);
      uv = inTexCoord;
    }
    `;
    const screenPs = `precision highp float;
    varying vec2 uv;
    uniform sampler2D u_mask;
    uniform float u_smoothness;
    uniform float u_invert;
    uniform float u_useCutoutTexture;
    uniform float u_cutoutTexutureInverseY;
    uniform sampler2D u_cutoutTex;
    uniform sampler2D u_mask2;
    uniform float u_useMask2;
    void main() {
      float maskAlpha = texture2D(u_mask, uv).r;
      if (u_useMask2 > 0.5) {
        maskAlpha += texture2D(u_mask2, uv).r;
      }
      maskAlpha = smoothstep(0.0 + (u_smoothness),1.0,maskAlpha);
      if(u_invert > 0.5) {
        maskAlpha = 1.0 - maskAlpha;
      }
      if (u_useCutoutTexture > 0.5) {
        if (u_cutoutTexutureInverseY > 0.5) {
          gl_FragColor = texture2D(u_cutoutTex, vec2(uv.x, 1.0 - uv.y));
        } else {
          gl_FragColor = texture2D(u_cutoutTex, uv);
        }
        gl_FragColor.a = maskAlpha;
      } else {
        gl_FragColor = vec4(maskAlpha, maskAlpha, maskAlpha, 1.0);
      }
    }
    `;
    const shaders = RenderingUtil.createShaders(screenVs, screenPs);
    this._screenMaterial = RenderingUtil.createScreenMaterial(shaders);

    this._screenMaterial.setTex('u_mask', Segmentation.getMask(this._segType));

    this._screenMaterial.setFloat('u_smoothness', 0.9 * (1.0 - this._smoothness)); //normalizing values for 0.1 to 1.0 to avoid visual artifacts below values of 0.1


    this._screenMaterial.setFloat('u_invert', this._invert === true ? 1.0 : 0.0);

    if (this._useCutoutTexture === true) {
      const cutoutTexture = Engine.engine.assets.loadSync(this._cutoutTexture);

      if (cutoutTexture != null) {
        this._useCutoutTexture = true;

        this._screenMaterial.setTex('u_cutoutTex', cutoutTexture.resource);

        this._screenMaterial.setFloat('u_cutoutTexutureInverseY', this._cutoutTexutureInverseY === true ? 1.0 : 0.0);
      }
    }

    this._screenMaterial.setFloat('u_useCutoutTexture', this._useCutoutTexture === true ? 1.0 : 0.0); // For head mask, we merge at most two persons' masks togather


    if (this._segType === exports.SegmentationType.Head.toLocaleLowerCase()) {
      this._screenMaterial.setFloat('u_useMask2', 1.0);

      this._screenMaterial.setTex('u_mask2', Segmentation.getMask(this._segType, 1));
    } else {
      this._screenMaterial.setFloat('u_useMask2', 0.0);
    }
  }

  onUpdate() {
    const cmdBufHelper = Engine.engine.customAssets.cmdBufferHelper;
    cmdBufHelper.cmdBufferSetRenderTexture(this._renderTexture);
    cmdBufHelper.cmdBufferDrawMesh(cmdBufHelper.screenMesh, new Mat4(), this._screenMaterial, 0, 0, new Amaz.MaterialPropertyBlock());
  }

  get type() {
    return exports.AssetSubType.Segmentation;
  }

  onDestroy() {
    return;
  }

  onLateUpdate() {
    return;
  }

  onStart() {// empty
  }

}

/* eslint-disable @typescript-eslint/no-explicit-any */

class FaceMeshAsset {
  constructor(config) {
    var _Engine$engine;

    const properties = config.properties;
    this._faceIndex = properties.faceIndex;
    this._path = properties.path;
    this._faceMesh = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.customAssets.getNativeObject(config.uuid); //Load user custom face mesh and create a clone object,
    //which will be updated by algorithm and morpher.

    const inputMesh = Engine.engine.assets.loadSync(this._path);

    if (inputMesh !== null) {
      const customMesh = inputMesh.resource.clone(); //Align properties with the customMesh.
      //We need to make sure the faceMesh is still the object returned to the engine,
      //so we can only modify the internal properties.

      this._faceMesh.assetMgr = customMesh.assetMgr;
      this._faceMesh.name = customMesh.name;
      this._faceMesh.boundingBox = customMesh.boundingBox;
      this._faceMesh.instanceData = customMesh.instanceData;
      this._faceMesh.instanceDataStride = customMesh.instanceDataStride;
      this._faceMesh.materialIndex = customMesh.materialIndex;
      this._faceMesh.morphers = customMesh.morphers;
      this._faceMesh.skin = customMesh.skin;
      this._faceMesh.submeshes = customMesh.submeshes;
      this._faceMesh.vertexAttribs = customMesh.vertexAttribs;
      this._faceMesh.vertices = customMesh.vertices;
      this._faceMesh.seqMesh = customMesh.seqMesh;
      this._faceMesh.originalVertices = customMesh.originalVertices;
      this._faceMesh.clearAfterUpload = customMesh.clearAfterUpload;

      this._faceMesh.setVertexCount(customMesh.getVertexCount());

      if (customMesh.getVertexArray(0, 0).size() !== 0) {
        this._faceMesh.setVertexArray(customMesh.getVertexArray(0, 0), 0, 0, true);
      }

      if (customMesh.getNormalArray(0, 0).size() !== 0) {
        this._faceMesh.setNormalArray(customMesh.getNormalArray(0, 0), 0, 0);
      }

      if (customMesh.getTangentArray(0, 0).size() !== 0) {
        this._faceMesh.setTangentArray(customMesh.getTangentArray(0, 0), 0, 0);
      }

      if (customMesh.getColorArray(0, 0).size() !== 0) {
        this._faceMesh.setColorArray(customMesh.getColorArray(0, 0), 0, 0);
      }

      if (customMesh.getUvArray(0, 0, 0).size() !== 0) {
        this._faceMesh.setUvArray(0, customMesh.getUvArray(0, 0, 0), 0, 0);
      }

      if (customMesh.getUv3DArray(0, 0, 0).size() !== 0) {
        this._faceMesh.setUv3DArray(0, customMesh.getUv3DArray(0, 0, 0), 0, 0);
      }

      if (customMesh.getUserDefineArray(0, 0, 0).size() !== 0) {
        this._faceMesh.setUserDefineArray(0, customMesh.getUserDefineArray(0, 0, 0), 0, 0);
      } //Find a morpher in the scene that might use this mesh, and update the mesh inside the morpher


      this.setUpMorpher(this._faceMesh, false);
    } else {
      console.error('face mesh asset: mesh not found!');
    }
  }

  onDestroy() {
    return;
  }

  onStart() {// empty
  }

  onUpdate() {
    if (this._faceMesh !== null) {
      // Face mesh update by algorithm
      const faces = Head.faces;
      const faceCount = faces.length;

      if (this._faceIndex < 0 || this._faceIndex > 5) {
        this._faceIndex = 0;
      }

      if (faceCount <= this._faceIndex) {
        return;
      }

      const faceMeshInfo = faces[this._faceIndex].faceMesh;

      if (faceMeshInfo === null) {
        return;
      }

      const oriPos = faceMeshInfo.vertexes;
      const oriNormals = faceMeshInfo.normals;

      if (oriPos !== null && oriNormals !== null && 0 < oriPos.size() && 0 < oriNormals.size()) {
        //Algorithm update the faceMesh.
        this._faceMesh.setVertexArray(oriPos);

        this._faceMesh.setNormalArray(oriNormals); //Set the mesh that has been updated by the algorithm to morpher


        this.setUpMorpher(this._faceMesh, true);
      }
    }
  }

  onLateUpdate() {
    return;
  }

  get type() {
    return exports.AssetSubType.Face;
  }

  setUpMorpher(mesh, init) {
    if (mesh !== null) {
      const scene = Engine.engine.scene.native; //FIXME: see if we can easily get morpher component that related to this mesh, depends on engine morpher change.

      const entities = scene.entities;

      for (let i = 0; i < entities.size(); i++) {
        const entity = entities.get(i);
        const MorpherComp = entity.getComponent('MorpherComponent');

        if (MorpherComp !== null) {
          if (MorpherComp.basemesh.guid.equals(mesh.guid)) {
            if (!init) {
              //Here we need to store some properties of the morpher temporarily
              //because it will be clear when we replace the empty mesh set during initialization.
              const channelWeightsTemp = MorpherComp.channelWeights.clone();
              const channelWeightsKeys = channelWeightsTemp.getVectorKeys();
              const channelAmplifiersTemp = MorpherComp.channelAmplifiers.clone();
              const channelAmplifiersKeys = channelAmplifiersTemp.getVectorKeys();
              MorpherComp.basemesh = null;
              MorpherComp.basemesh = mesh;
              const channelWeights = MorpherComp.channelWeights;
              const channelAmplifiers = MorpherComp.channelAmplifiers;

              for (let i = 0; i < channelWeightsTemp.size(); i++) {
                channelWeights.set(channelWeightsKeys.get(i), channelWeightsTemp.get(channelWeightsKeys.get(i)));
              }

              for (let i = 0; i < channelAmplifiersTemp.size(); i++) {
                channelAmplifiers.set(channelAmplifiersKeys.get(i), channelAmplifiersTemp.get(channelAmplifiersKeys.get(i)));
              }
            } else {
              MorpherComp.basemesh = mesh;
            }
          }
        }
      }
    }
  }

}

/* eslint-disable @typescript-eslint/no-explicit-any */

const BuiltInCustomTexture = /*#__PURE__*/new Map([[/*#__PURE__*/exports.AssetSubType.CameraInput.toLowerCase(), CamInputTextureAsset], [/*#__PURE__*/exports.AssetSubType.Face.toLowerCase(), FaceTextureAsset], [/*#__PURE__*/exports.AssetSubType.Segmentation.toLowerCase(), SegTextureAsset]]);
const BuiltInCustomMesh = /*#__PURE__*/new Map([[/*#__PURE__*/exports.AssetSubType.Face.toLowerCase(), FaceMeshAsset]]);
const BuiltInCustomAssetProvider = /*#__PURE__*/new Map([[/*#__PURE__*/exports.AssetType.Texture.toLowerCase(), BuiltInCustomTexture], [/*#__PURE__*/exports.AssetType.Mesh.toLowerCase(), BuiltInCustomMesh]]);

/* eslint-disable @typescript-eslint/no-explicit-any */

function ab2str(buf) {
  const array = new Uint8Array(buf);
  return String.fromCharCode.apply(null, array);
}

class CustomAssetRegistry {
  constructor() {
    this._resEntryMap = new Map();
    this._assets = new Array();
    this._nativeObjMap = new Amaz.Map();
    this._cmdBufferHelper = new CmdBufferHelper();
  }
  /**
   * @function
   * @name CustomAssetRegistry#getNativeObject
   * @returns {any} the native object corresponding to the custom asset
   * @description As engine cannot excute any JS code when loading a scene.
   * We need to create all the native objects beforehand. Use this method to
   * get the native object of a custom asset rather than create by itself
   * @param {string} uuid uuid of a custom asset
   * @sdk 10.1.0
   */


  getNativeObject(uuid) {
    return this._nativeObjMap.get(uuid);
  }

  init() {
    var _Engine$engine;

    const scene = (_Engine$engine = Engine.engine) == null ? void 0 : _Engine$engine.scene.native;

    if (scene == null) {
      return;
    }

    const configPath = scene.assetMgr.rootDir + 'customAssets.json';
    const hasConfig = fs.accessSync(configPath, 0);

    if (!hasConfig) {
      console.log('No customAssets.json found');
      return;
    }

    const f = fs.readFileSync(configPath);
    this._assetsConfig = JSON.parse(ab2str(f));

    if (this._assetsConfig == null) {
      return;
    }

    this._nativeObjMap = scene.assetMgr.getAllScriptCustomAssets();

    for (const config of this._assetsConfig) {
      this._resEntryMap.set(config.uuid, config);
    }

    const updateOrder = this.analyzeAssetsDependency();

    for (const uuid of updateOrder) {
      const config = this._resEntryMap.get(uuid);

      const asset = this.createCustomAsset(config);

      if (asset) {
        this._assets.push(asset);
      }
    }
  }

  get cmdBufferHelper() {
    return this._cmdBufferHelper;
  }

  update(dt) {
    this._cmdBufferHelper.onPreUpdate();

    for (const asset of this._assets) {
      asset.onUpdate(dt);
    }

    this._cmdBufferHelper.onPostUpdate();
  }

  start() {
    for (const asset of this._assets) {
      asset.onStart();
    }
  }

  destroy() {
    for (const asset of this._assets) {
      asset.onDestroy();
    }
  }

  lateUpdate(dt) {
    for (const asset of this._assets) {
      asset.onLateUpdate(dt);
    }
  }

  createCustomAsset(config) {
    const provider = BuiltInCustomAssetProvider.get(config.type.toLowerCase());

    if (provider == null) {
      console.error(`Custom asset doesn't support asset type: [${config.type}]`);
      return null;
    }

    const ctr = provider.get(config.subType.toLowerCase());

    if (ctr == null) {
      console.error(`[${config.type}] custom asset doesn't support asset subtype: [${config.subtype}]`);
      return null;
    }

    return new ctr(config);
  }
  /**
   * @function
   * @name CustomAssetRegistry#analyzeAssetsDependency
   * @returns {Array<string>} assets update order
   * @description assets might depend on each other. For example, a segmentation asset might
   * depend on a camera input asset. This method analyzes dependency relationship across assets
   * using topological sort. And outputs a update order.
   */


  analyzeAssetsDependency() {
    let order = new Array();
    const adjList = new Map();
    const inDeg = new Map();
    const customAssetHeader = 'custom://';
    let assetCnt = 0; // build graph

    for (const config of this._assetsConfig) {
      assetCnt += 1;
      inDeg.set(config.uuid, 0);
    }

    for (const config of this._assetsConfig) {
      const from = config.uuid;

      if (config.properties) {
        for (const k in config.properties) {
          const property = config.properties[k];

          if (typeof property === 'string' && property.startsWith(customAssetHeader)) {
            const to = property.substr(customAssetHeader.length);
            console.log(`custom assets: [${from}] depends on [${to}]`);
            inDeg.set(to, inDeg.get(to) + 1);

            if (!adjList.has(from)) {
              adjList.set(from, new Array());
            }

            adjList.get(from).push(to);
          }
        }
      }
    } // topological sort


    const q = new Array();

    for (const id of inDeg.keys()) {
      if (inDeg.get(id) === 0) {
        q.push(id);
      }
    }

    while (q.length > 0) {
      const top = q.shift();
      order.push(top);

      if (adjList.has(top)) {
        for (const id of adjList.get(top)) {
          inDeg.set(id, inDeg.get(id) - 1);

          if (inDeg.get(id) === 0) {
            q.push(id);
          }
        }
      }
    } // check final result


    if (order.length === assetCnt) {
      order.reverse();
    } else {
      console.error('Found circular dependency in custom assets'); // rollback to assets declaration order

      order = new Array();

      for (const config of this._assetsConfig) {
        order.push(config.uuid);
      }
    }

    return order;
  }

}

/**
 * @class
 * @category Algorithm
 * @name Hand
 * @classdesc A Hand class provides capabilities for hand tracking,
 * gesture recognition, 2D keypoint tracking, 3D keypoint tracking, etc.
 * @description Constructor to create a Hand instance.
 * @augments EventHandler
 * @sdk 9.8.0
 */

/**
 * @event Hand#detected
 * @description Fire when a hand is detected.
 * @param {number} id - ID of the detected hand.
 * @example
 * // use event enum
 * amg.Hand.on(amg.HandEvent.Detected, function(id){
 *   console.log("Start tracking hand: " + id);
 * })
 *
 * // use event string
 * amg.Hand.on('detected', function(id){
 *   console.log("Start tracking hand: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event Hand#lost
 * @description Fire when a hand lose tracking state.
 * @param {number} id - ID of the hand which lose tracking.
 * @example
 * // use event enum
 * amg.Hand.on(amg.HandEvent.Lost, function(id){
 *   console.log("Lose tracking hand: " + id);
 * })
 *
 * // use event string
 * amg.Hand.on('lost', function(id){
 *   console.log("Lose tracking hand: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event Hand#staticgesture
 * @description Fire when a hand static gesture is detected or changed.
 * @param {number} id - ID of the hand which static gesture is detected or changed.
 * @param {HandDynamicGesture} action - Action detected.
 * @example
 * // use event enum
 * amg.Hand.on(amg.HandEvent.StaticGesture, function(id, action){
 *   console.log("Detected hand static action from " + id + " action is: " + action) ;
 * })
 *
 * // use event string
 * amg.Hand.on('staticgesture', function(id, action){
 *   console.log("Detected hand static action from " + id + " action is: " + action) ;
 * })
 * @sdk 9.8.0
 */

/**
 * @event Hand#dynamicgesture
 * @description Fire when a hand dynamic gesture is detected or changed.
 * @param {number} id - ID of the hand which dynamic gesture is detected or changed
 * @param {HandDynamicGesture} action - Action detected.
 * @example
 * // use event enum
 * amg.Hand.on(amg.HandEvent.DynamicGesture, function(id, action){
 *   console.log("Detected hand dynamic action from " + id + " action is: " + action) ;
 * })
 *
 * // use event string
 * amg.Hand.on('dynamicgesture', function(id, action){
 *   console.log("Detected hand dynamic action from " + id + " action is: " + action) ;
 * })
 * @sdk 9.8.0
 */

class Hand extends EventHandler {
  constructor() {
    super();
    this.hands = new Array();
    this._handProvider = new HandDataProvider(this);
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Hand();
    }

    return this._instance;
  }
  /**
   * @name Hand#hands
   * @type {HandData[]}
   * @description The {@link HandData} array with maximum 2 hands supported. hands[0] is the first hand the algorithm detected.
   * @readonly
   * @static
   */


  static get hands() {
    return this.getInstance().hands;
  }
  /**
   * @function
   * @name Hand.on
   * @description Attach an event handler to an event with the specified name.
   * @param {HandEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static on(event, callback, scope) {
    return this.getInstance().on(event, callback, scope);
  }
  /**
   * @function
   * @name Hand.off
   * @description Detach an event with a specific name, if there is no name provided, all the events are detached.
   * @param {HandEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static off(event, callback, scope) {
    return this.getInstance().off(event, callback, scope);
  }

  onUpdate() {
    this._handProvider.onUpdate();
  }

  init() {
    return;
  }

  setHandState(hasHand, id) {
    if (hasHand) {
      this.fire(exports.HandEvent.Detected, id);
    } else {
      this.fire(exports.HandEvent.Lost, id);
    }
  } //ignore invalid gesture


  setHandActionState(id, action) {
    if (action !== exports.HandStaticGesture.None && action !== exports.HandStaticGesture.Unknown) {
      this.fire(exports.HandEvent.StaticGesture, id, action);
    }
  }

  setHandSeqActionState(id, action) {
    if (action !== exports.HandDynamicGesture.None) {
      this.fire(exports.HandEvent.DynamicGesture, id, action);
    }
  }

}
/**
 * @class
 * @category Algorithm
 * @name HandData
 * @classdesc A HandData class stores hand algorithm result including tracking points information, scale, rotation, left or right hand and gestures.
 * @description Constructor to create a new HandData instance.
 */

class HandData {
  constructor() {
    this._handInfo = null;
  }
  /**
   * @function
   * @name HandData#getKeyPoint2D
   * @description Returns a key point 2D position (screen space).
   * @param {HandKeyPoint} keyPoint - The key point that will return result.
   * @returns {Vec2} 2D key point coordinates.
   * @readonly
   */


  getKeyPoint2D(keyPoint) {
    if (this._handInfo.key_points_is_detect.get(keyPoint) === 1) {
      return this._handInfo.key_points_xy.get(keyPoint);
    } else {
      return null;
    }
  }
  /**
   * @function
   * @name HandData#getKeyPointOffset3D
   * @description Returns the 3D offset value of the specified keypoint relative to amg.HandKeyPoint.Middle3, with data in the range [-1~1]. The position of Middle3 is always (0, 0, 0) and the amg.HandKeyPoint.center is not available.
   * @param {HandKeyPoint} keyPoint - The key point that will return result.
   * @returns {Vec3} Key point offset in 3D position.
   * @readonly
   */


  getKeyPointOffset3D(keyPoint) {
    if (this._handInfo.key_points_3d_is_detect.get(keyPoint) === 1) {
      return this._handInfo.key_points_3d.get(keyPoint);
    } else {
      return null;
    }
  }
  /**
   * @name HandData#isLeftProbability
   * @description Returns the possibility that the hand being tracked is the left hand. Since the front camera of the phone captures the mirror image, the algorithm results of the front and back cameras will have opposite results.
   * @type {number}
   * @readonly
   */


  get isLeftProbability() {
    return this._handInfo.left_prob;
  }
  /**
   * @name HandData#isLeft
   * @description Returns whether the tracked hand is left-handed or not. On some machines, the algorithm results converge slowly and the result is unstable.
   * @type {boolean}
   * @readonly
   */


  get isLeft() {
    if (this.isLeftProbability < 0.5) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * @name HandData#id
   * @description The tracked hand ID.
   * @type {number}
   * @readonly
   */


  get id() {
    return this._handInfo.ID;
  }
  /**
   * @name HandData#scale
   * @description The scaling value of the returned hand, which is related to the resolution, needs to be normalized to the resolution before being used.
   * @type {number}
   * @readonly
   */


  get scale() {
    return this._handInfo.scale;
  }
  /**
   * @name HandData#rotation
   * @description Rotation around the z-axis, in the range of [-180~180].
   * @type {number}
   * @readonly
   */


  get rotation() {
    const p2 = this.getKeyPoint2D(9);
    const p1 = this.getKeyPoint2D(12);
    if (p1 == null || p2 == null) return 0;
    const x1 = p1.x - p2.x;
    const y1 = p1.y - p2.y;
    const dot = y1;
    const norm = Math.sqrt(x1 * x1 + y1 * y1);
    return -x1 / Math.abs(x1) * Math.acos(dot / norm) * 180 / Math.PI;
  }
  /**
   * @name HandData#staticGesture
   * @description Current static gesture.
   * @type {HandStaticGesture}
   * @readonly
   */


  get staticGesture() {
    return this._handInfo.action;
  }
  /**
   * @name HandData#dynamicGesture
   * @description Current dynamic gesture.
   * @type {HandDynamicGesture}
   * @readonly
   */


  get dynamicGesture() {
    return this._handInfo.seq_action;
  }

}
/**
 * Get hand algo result from engine, process the hand statement.
 *
 * @ignore
 */


class HandDataProvider {
  constructor(mgr) {
    this._mgr = mgr; //remember the hand id and gestures we have in last update

    this.lastHandIdSet = new Set();
    this.ActIDMap = new Map();
    this.SeqActIDMap = new Map();
  }

  onUpdate() {
    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult();
    const handCount = algResult.getHandCount();
    this._mgr.hands = new Array(handCount);
    const handIdSet = new Set();

    if (handCount > 0) {
      for (let handIndex = 0; handIndex < handCount; handIndex++) {
        const handInfo = algResult.getHandInfo(handIndex);
        const handData = new HandData();
        this._mgr.hands[handIndex] = handData; //if new hand in algo result, fire its detect gesture

        if (handInfo != null) {
          handData._handInfo = handInfo;

          if (!this.lastHandIdSet.has(handData.id)) {
            this._mgr.setHandState(true, handData.id);
          } //if old hand has gesture changes, fire the updated gesture


          if (this.ActIDMap.has(handData.id)) {
            if (this.ActIDMap.get(handData.id) !== handData.staticGesture) {
              this._mgr.setHandActionState(handData.id, handData.staticGesture);

              this.ActIDMap.set(handData.id, handData.staticGesture);
            }
          } else {
            this.ActIDMap.set(handData.id, handData.staticGesture);

            this._mgr.setHandActionState(handData.id, handData.staticGesture);
          }

          if (this.SeqActIDMap.has(handData.id)) {
            if (this.SeqActIDMap.get(handData.id) !== handData.dynamicGesture) {
              this._mgr.setHandSeqActionState(handData.id, handData.dynamicGesture);

              this.SeqActIDMap.set(handData.id, handData.dynamicGesture);
            }
          } else {
            this.SeqActIDMap.set(handData.id, handData.dynamicGesture);

            this._mgr.setHandSeqActionState(handData.id, handData.dynamicGesture);
          }

          handIdSet.add(handData.id);
        }
      } //update the set and map based on new hand algo result


      for (const handID of this.lastHandIdSet.values()) {
        if (!handIdSet.has(handID)) {
          this._mgr.setHandState(false, handID);
        }
      }

      for (const handID of this.ActIDMap.keys()) {
        if (!handIdSet.has(handID)) {
          this.ActIDMap.delete(handID);
        }
      }

      for (const handID of this.SeqActIDMap.keys()) {
        if (!handIdSet.has(handID)) {
          this.SeqActIDMap.delete(handID);
        }
      }

      this.lastHandIdSet.clear();
      handIdSet.forEach(value => this.lastHandIdSet.add(value));
    } else {
      //if no hand detected clean the maps and set
      this.ActIDMap.clear();
      this.SeqActIDMap.clear();

      for (const handID of this.lastHandIdSet.values()) {
        this._mgr.setHandState(false, handID);
      }

      this.lastHandIdSet.clear();
    }
  }

}

/**
 * @class
 * @category Algorithm
 * @name Body2D
 * @classdesc A Body2D class provides capabilities to detect 2D
 * skeletal keypoints from the human body.
 * @description Constructor to create a Body2D instance.
 * @augments EventHandler
 * @sdk 9.8.0
 */

/**
 * @event Body2D#detected
 * @description Fire when a body is detected.
 * @param {number} id - ID of the detected body.
 * @example
 * // use event enum
 * amg.Body2D.on(amg.BodyEvent.Detected, function(id){
 *   console.log("Start tracking body: " + id);
 * })
 *
 * // use event string
 * amg.Body2D.on('detected', function(id){
 *   console.log("Start tracking body: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event Body2D#lost
 * @description Fire when a body loses tracking state.
 * @param {number} id - ID of the body which loses tracking.
 * @example
 * // use event enum
 * amg.Body2D.on(amg.BodyEvent.Lost, function(id){
 *   console.log("Lose tracking body: " + id);
 * })
 *
 * // use event string
 * amg.Body2D.on('lost', function(id){
 *   console.log("Lose tracking body: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event Body2D#action
 * @description Fire when a body action recognized or changed.
 * @param {number} id - ID of the body that has recognized a new action or change in action.
 * @param {number} BodyAction - Action label recognized.
 * @example
 * // use event enum
 * amg.Body2D.on(amg.BodyEvent.Action, function(action, id){
 *   console.log("Detected body action from " + id + " action label is: " + action) ;
 * })
 *
 * // use event string
 * amg.Body2D.on('action', function(action, id){
 *   console.log("Detected body action from " + id + " action label is: " + action) ;
 * })
 * @sdk 9.8.0
 */

class Body2D extends EventHandler {
  constructor() {
    super();
    this.bodies = new Array();
    this._body2dProvider = new Body2dDataProvider(this);
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Body2D();
    }

    return this._instance;
  }
  /**
   * @name Body2D#bodies
   * @type {Body2dData[]}
   * @description The {@link Body2dData} array with maximum 2 bodies supported. Bodies[0] is the first body the algorithm detected.
   * @readonly
   * @static
   */


  static get bodies() {
    return this.getInstance().bodies;
  }
  /**
   * @function
   * @name Body2D.on
   * @description Attach an event handler to an event with the specified name.
   * @param {BodyEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static on(event, callback, scope) {
    return this.getInstance().on(event, callback, scope);
  }
  /**
   * @function
   * @name Body2D.off
   * @description Detach an event with a specific name, if there is no name provided, all the events are detached.
   * @param {BodyEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static off(event, callback, scope) {
    return this.getInstance().off(event, callback, scope);
  }

  onUpdate() {
    this._body2dProvider.onUpdate();
  }

  init() {
    return;
  }

  setBodyState(hasBody, id) {
    if (hasBody) {
      this.fire(exports.BodyEvent.Detected, id);
    } else {
      this.fire(exports.BodyEvent.Lost, id);
    }
  }

  setBodyActionState(id, BodyAction) {
    if (BodyAction !== -1) {
      this.fire(exports.BodyEvent.Action, id, BodyAction);
    }
  }

}
/**
 * @class
 * @category Algorithm
 * @name Body2dData
 * @classdesc A Body2dData class stores the joints data of body2d including position, rotation and score.
 * @description Constructor to create a Body2dData instance.
 */

class Body2dData {
  constructor() {
    this._skeletonInfo = null;
    this._actionRecognitionInfo = null;
  }
  /**
   * @name Body2dData#rect
   * @description The normalized human body area rectangle, in the range of [0.5-1], needs to be converted if it is to be used in screen space.
   * @type {Rect}
   * @readonly
   */


  get rect() {
    return this._skeletonInfo.rect;
  }
  /**
   * @name Body2dData#id
   * @description The algorithm detects the corresponding ID of the human body.
   * @type {number}
   * @readonly
   */


  get id() {
    return this._skeletonInfo.ID;
  }
  /**
   * @name Body2dData#keyPointDetected
   * @description Returns whether each keypoint is detected or not, using the index access result of the corresponding keypoint. If not detected then the value is 0.
   * @type {UInt8Vector}
   * @readonly
   */


  get keyPointDetected() {
    return this._skeletonInfo.key_points_detected;
  }
  /**
   * @name Body2dData#keyPointsScore
   * @description Returns the confidence value of each key point in the range of [0-1], using the index of the corresponding key point to access the result.
   * @type {FloatVector}
   * @readonly
   */


  get keyPointsScore() {
    return this._skeletonInfo.key_points_score;
  }
  /**
   * @name Body2dData#keyPoints
   * @description The normalized 2D keypoint coordinates are in the range [0.5-1] and need to be converted if they are to be used in screen space.
   * @type {Vec2Vector}
   * @readonly
   */


  get keyPoints() {
    return this._skeletonInfo.key_points_xy;
  }
  /**
   * @name Body2dData#isActionValid
   * @description Return true if it successfully detects the action to this body.
   * @type {boolean}
   * @readonly
   */


  get isActionValid() {
    return this._actionRecognitionInfo.isValid;
  }
  /**
   * @name Body2dData#actionLabel
   * @description Action index recognized by the algorithm, depending on action_recognition_tmpl.
   * @type {number}
   * @readonly
   */


  get actionLabel() {
    return this._actionRecognitionInfo.actionLabel;
  }
  /**
   * @name Body2dData#actionScore
   * @description Confidence level of the action recognition results.
   * @type {number}
   * @readonly
   */


  get actionScore() {
    return this._actionRecognitionInfo.actionScore;
  }

}
/**
 * Get body2d algo result from engine, process the body statement.
 *
 * @ignore
 */


class Body2dDataProvider {
  constructor(mgr) {
    this._mgr = mgr; //use ID set to remember the body IDs

    this.lastSkeletonIdSet = new Set();
    this.ActIDMap = new Map();
  }

  onUpdate() {
    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult();
    const skeletonCount = algResult.getSkeletonCount();
    this._mgr.bodies = new Array(skeletonCount);
    const skeletonIdSet = new Set();

    if (skeletonCount > 0) {
      for (let bodyIndex = 0; bodyIndex < skeletonCount; bodyIndex++) {
        const skeletonInfo = algResult.getSkeletonInfo(bodyIndex);
        const actionRecognitionInfo = algResult.getActionRecognitionInfo(bodyIndex);
        const bodyData = new Body2dData();
        this._mgr.bodies[bodyIndex] = bodyData;

        if (skeletonInfo != null) {
          bodyData._skeletonInfo = skeletonInfo; //if the id is new, fire detected

          if (!this.lastSkeletonIdSet.has(bodyData.id)) {
            this._mgr.setBodyState(true, bodyData.id);
          }

          if (actionRecognitionInfo != null) {
            bodyData._actionRecognitionInfo = actionRecognitionInfo;

            if (this.ActIDMap.has(bodyData.id)) {
              if (this.ActIDMap.get(bodyData.id) !== bodyData.actionLabel) {
                this._mgr.setBodyActionState(bodyData.id, bodyData.actionLabel);

                this.ActIDMap.set(bodyData.id, bodyData.actionLabel);
              }
            } else {
              this.ActIDMap.set(bodyData.id, bodyData.actionLabel);

              this._mgr.setBodyActionState(bodyData.id, bodyData.actionLabel);
            }
          }

          skeletonIdSet.add(bodyData.id);
        }
      }

      for (const skeletonID of this.lastSkeletonIdSet.values()) {
        if (!skeletonIdSet.has(skeletonID)) {
          //if id is not found, fire lost
          this._mgr.setBodyState(false, skeletonID);
        }
      }

      for (const bodyID of this.ActIDMap.keys()) {
        if (!skeletonIdSet.has(bodyID)) {
          this.ActIDMap.delete(bodyID);
        }
      }

      this.lastSkeletonIdSet.clear();
      skeletonIdSet.forEach(value => this.lastSkeletonIdSet.add(value));
    } else {
      this.ActIDMap.clear();

      for (const skeletonID of this.lastSkeletonIdSet.values()) {
        //if no body detected fire lost for all id
        this._mgr.setBodyState(false, skeletonID);
      }

      this.lastSkeletonIdSet.clear();
    }
  }

}

/**
 * @class
 * @category Algorithm
 * @name Body3D
 * @classdesc A Body3D class provides capabilities to detect
 * Avatar3D joint points from the human body.
 * @description Constructor to create a Body3D instance.
 * @augments EventHandler
 * @sdk 9.8.0
 */

/**
 * @event Body3D#detected
 * @description Fire when a body is detected.
 * @param {number} id - ID of the detected body.
 * @example
 * // use event enum
 * amg.Body3D.on(amg.BodyEvent.Detected, function(id){
 *   console.log("Start tracking body: " + id);
 * })
 *
 * // use event string
 * amg.Body3D.on('detected', function(id){
 *   console.log("Start tracking body: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event Body3D#lost
 * @description Fire when a body loses tracking state.
 * @param {number} id - ID of the body which loses tracking.
 * @example
 * // use event enum
 * amg.Body3D.on(amg.BodyEvent.Lost, function(id){
 *   console.log("Lose tracking body: " + id);
 * })
 *
 * // use event string
 * amg.Body3D.on('lost', function(id){
 *   console.log("Lose tracking body: " + id);
 * })
 * @sdk 9.8.0
 */

class Body3D extends EventHandler {
  constructor() {
    super();
    this._trackingMode = false;
    this.bodies = new Array();
    this._Body3dProvider = new Body3dDataProvider(this);
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Body3D();
    }

    return this._instance;
  }
  /**
   * @name Body3D#bodies
   * @type {Body3dData[]}
   * @description The {@link Body3dData} array with maximum 2 bodies supported. Bodies[0] is the first body the algorithm detected.
   * @readonly
   * @static
   */


  static get bodies() {
    return this.getInstance().bodies;
  }
  /**
   * @function
   * @name Body3D.on
   * @description Attach an event handler to an event with the specified name.
   * @param {BodyEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static on(event, callback, scope) {
    return this.getInstance().on(event, callback, scope);
  }
  /**
   * @function
   * @name Body3D.off
   * @description Detach an event with a specific name, if there is no name provided, all the events are detached.
   * @param {BodyEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static off(event, callback, scope) {
    return this.getInstance().off(event, callback, scope);
  }
  /**
   * @name Body3D#trackingMode
   * @type {boolean}
   * @description Return avatar3d algorithm tracking mode.
   * @readonly
   * @static
   */


  static get trackingMode() {
    return this.getInstance()._trackingMode;
  }

  onUpdate() {
    this._Body3dProvider.onUpdate();
  }

  init() {
    return;
  }

  setBodyState(hasBody, id) {
    if (hasBody) {
      this.fire(exports.BodyEvent.Detected, id);
    } else {
      this.fire(exports.BodyEvent.Lost, id);
    }
  }

}
/**
 * @class
 * @category Algorithm
 * @name Body3dData
 * @classdesc A Body2dData class stores the joints data of body3d including position, rotation, camera fov and algorithm image size.
 * @description Constructor to create a new Body3dData instance.
 */

class Body3dData {
  constructor() {
    this._avatar3DInfo = null;
  }
  /**
   * @name Body3dData#id
   * @description The algorithm detects the corresponding ID of the human body.
   * @type {number}
   * @readonly
   */


  get id() {
    return this._avatar3DInfo.tracking_id;
  }
  /**
   * @name Body3dData#root
   * @description The 3D coordinates of the root node, which is amg.Body3DKeyPointType.Pelvis .
   * @type {Vec3}
   * @readonly
   */


  get root() {
    return this._avatar3DInfo.root;
  }
  /**
   * @name Body3dData#focalLength
   * @description Focal length is used to calculate and adjust the relevant parameters of the camera in the scene.
   * @type {number}
   * @readonly
   */


  get focalLength() {
    return this._avatar3DInfo.focal_length;
  }
  /**
   * @name Body3dData#isDetected
   * @description Return whether the body is detected or not.
   * @type {boolean}
   * @readonly
   */


  get isDetected() {
    return this._avatar3DInfo.detected;
  }
  /**
   * @name Body3dData#jointRotations
   * @description Returns the vector of quaternions on the 24 joints corresponding to the Body3DKeyPointType.
   * @type {Amaz.QuatVector}
   * @readonly
   */


  get jointRotations() {
    return this._avatar3DInfo.quaternion;
  }
  /**
   * @name Body3dData#jointPositions
   * @description Returns the vector of positions on the 24 joints corresponding to the Body3DKeyPointType.
   * @type {Amaz.Vec3Vector}
   * @readonly
   */


  get jointPositions() {
    return this._avatar3DInfo.joints;
  }
  /**
   * @name Body3dData#imageHeight
   * @description Return the image height of the avatar3d algorithm.
   * @type {number}
   * @readonly
   */


  get imageHeight() {
    return this._avatar3DInfo.imageHeight;
  }
  /**
   * @name Body3dData#imageWidth
   * @description Return the image width of the avatar3d algorithm.
   * @type {number}
   * @readonly
   */


  get imageWidth() {
    return this._avatar3DInfo.imageWidth;
  }

}
/**
 * Get body3d algo result from engine, process the body statement.
 *
 * @ignore
 */


class Body3dDataProvider {
  constructor(mgr) {
    this._mgr = mgr; //use ID set to remember the body IDs

    this.lastAvatar3dIdSet = new Set();
  }

  onUpdate() {
    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult(); //tracking mode is used to decide whether to enable skeleton 2d algorithm to help avatar3d

    this._mgr._trackingMode = algResult.getAvatar3DInfoTracking();
    const avatar3DCount = algResult.getAvatar3DInfoCount();
    this._mgr.bodies = new Array(avatar3DCount);
    const avatar3dIdSet = new Set();

    if (avatar3DCount > 0) {
      for (let bodyIndex = 0; bodyIndex < avatar3DCount; bodyIndex++) {
        const avatar3DInfo = algResult.getAvatar3DInfo(bodyIndex);
        const bodyData = new Body3dData();
        this._mgr.bodies[bodyIndex] = bodyData;

        if (avatar3DInfo != null) {
          bodyData._avatar3DInfo = avatar3DInfo; //if the id is new, fire detected

          if (!this.lastAvatar3dIdSet.has(bodyData.id)) {
            this._mgr.setBodyState(true, bodyData.id);
          }

          avatar3dIdSet.add(bodyData.id);
        }
      }

      for (const avatar3dID of this.lastAvatar3dIdSet.values()) {
        if (!avatar3dIdSet.has(avatar3dID)) {
          //if id is not found, fire lost
          this._mgr.setBodyState(false, avatar3dID);
        }
      }

      this.lastAvatar3dIdSet.clear();
      avatar3dIdSet.forEach(value => this.lastAvatar3dIdSet.add(value));
    } else {
      for (const skeletonID of this.lastAvatar3dIdSet.values()) {
        //if no body detected fire lost for all id
        this._mgr.setBodyState(false, skeletonID);
      }

      this.lastAvatar3dIdSet.clear();
    }
  }

}

/**
 * @class
 * @category Algorithm
 * @name AvatarDrive
 * @classdesc An AvatarDrive class provides capabilities to detect blendshape for 3D face expressions.
 * The definition and usage of blendshape is aligned with Apple ARkit.
 * @description Constructor to create a AvatarDrive instance.
 * @augments EventHandler
 * @sdk 9.8.0
 */

/**
 * @event AvatarDrive#detected
 * @description Fire when a AvatarDrive is detected.
 * @param {number} id - ID of the detected AvatarDrive.
 * @example
 * // use event enum
 * amg.AvatarDrive.on(amg.AvatarDriveEvent.Detected, function(id){
 *   console.log("Start tracking AvatarDrive: " + id);
 * })
 *
 * // use event string
 * amg.AvatarDrive.on('detected', function(id){
 *   console.log("Start tracking AvatarDrive: " + id);
 * })
 * @sdk 9.8.0
 */

/**
 * @event AvatarDrive#lost
 * @description Fire when a AvatarDrive loses tracking state.
 * @param {number} id - ID of the AvatarDrive which loses tracking.
 * @example
 * // use event enum
 * amg.AvatarDrive.on(amg.AvatarDriveEvent.Lost, function(id){
 *   console.log("Lose tracking AvatarDrive: " + id);
 * })
 *
 * // use event string
 * amg.AvatarDrive.on('lost', function(id){
 *   console.log("Lose tracking AvatarDrive: " + id);
 * })
 * @sdk 9.8.0
 */

class AvatarDrive extends EventHandler {
  constructor() {
    super();
    this.faces = new Array();
    this._AvatarDriveProvider = new AvatarDriveDataProvider(this);
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new AvatarDrive();
    }

    return this._instance;
  }
  /**
   * @name AvatarDrive#faces
   * @type {AvatarDriveData[]}
   * @description The {@link AvatarDrive} array, currently support 1 face.
   * @readonly
   * @static
   */


  static get faces() {
    return this.getInstance().faces;
  }
  /**
   * @function
   * @name AvatarDrive.on
   * @description Attach an event handler to an event with the specified name.
   * @param {AvatarDriveEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static on(event, callback, scope) {
    return this.getInstance().on(event, callback, scope);
  }
  /**
   * @function
   * @name AvatarDrive.off
   * @description Detach an event with a specific name, if there is no name provided, all the events are detached.
   * @param {AvatarDriveEvent} event
   * @param {any} callback
   * @returns {EventHandler} This instance for chaining.
   * @static
   */


  static off(event, callback, scope) {
    return this.getInstance().off(event, callback, scope);
  }

  onUpdate() {
    this._AvatarDriveProvider.onUpdate();
  }

  init() {
    return;
  }

  setAvatarDriveState(hasFace, id) {
    if (hasFace) {
      this.fire(exports.AvatarDriveEvent.Detected, id);
    } else {
      this.fire(exports.AvatarDriveEvent.Lost, id);
    }
  }

}
/**
 * @class
 * @category Algorithm
 * @name AvatarDriveData
 * @classdesc A AvatarDriveData class stores the channels data of AvatarDriveData, isTracking and id of face.
 * @description Constructor to create a AvatarDriveData instance.
 */

class AvatarDriveData {
  constructor() {
    this._avatarDriveInfo = null;
  }
  /**
   * @name AvatarDriveData#id
   * @description The algorithm detects the corresponding ID of the AvatarDrive face.
   * @type {number}
   * @readonly
   */


  get id() {
    return this._avatarDriveInfo.ID;
  }
  /**
   * @name AvatarDriveData#isTracking
   * @description Returns whether successfully tracking a face or not.
   * @type {boolean}
   * @readonly
   */


  get isTracking() {
    if (this._avatarDriveInfo.succ === 1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * @name AvatarDriveData#channels
   * @description Returns expression blendshape factor, blendshape definition is the same as Apple ARkit, total of 52 blendshapes.
   * @type {FloatVector}
   * @readonly
   */


  get channels() {
    return this._avatarDriveInfo.beta;
  }

}
/**
 * Get AvatarDrive algo result from engine, process the AvatarDrive statement.
 *
 * @ignore
 */


class AvatarDriveDataProvider {
  constructor(mgr) {
    this._mgr = mgr; //use ID set to remember the AvatarDrive IDs

    this.lastAvatarDriveIdSet = new Set();
  }

  onUpdate() {
    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult(); //tracking mode is used to decide whether to enable skeleton 2d algorithm to help avatar3d

    const avatarDriveCount = algResult.getAvatarDriveCount();
    this._mgr.faces = new Array(avatarDriveCount);
    const avatarDriveIdSet = new Set();

    if (avatarDriveCount > 0) {
      for (let avatarDriveIndex = 0; avatarDriveIndex < avatarDriveCount; avatarDriveIndex++) {
        const avatarDriveInfo = algResult.getAvatarDriveInfo(avatarDriveIndex);
        const avatarDriveData = new AvatarDriveData();
        this._mgr.faces[avatarDriveIndex] = avatarDriveData;

        if (avatarDriveInfo != null) {
          avatarDriveData._avatarDriveInfo = avatarDriveInfo; //if the id is new, fire detected

          if (!this.lastAvatarDriveIdSet.has(avatarDriveData.id)) {
            this._mgr.setAvatarDriveState(true, avatarDriveData.id);
          }

          avatarDriveIdSet.add(avatarDriveData.id);
        }
      }

      for (const avatarDriveID of this.lastAvatarDriveIdSet.values()) {
        if (!avatarDriveIdSet.has(avatarDriveID)) {
          //if id is not found, fire lost
          this._mgr.setAvatarDriveState(false, avatarDriveID);
        }
      }

      this.lastAvatarDriveIdSet.clear();
      avatarDriveIdSet.forEach(value => this.lastAvatarDriveIdSet.add(value));
    } else {
      for (const avatarDriveID of this.lastAvatarDriveIdSet.values()) {
        //if no AvatarDrive face detected fire lost for all id
        this._mgr.setAvatarDriveState(false, avatarDriveID);
      }

      this.lastAvatarDriveIdSet.clear();
    }
  }

}

class PluginRegistry {
  constructor() {
    this._plugins = {};
  }

  bufferToStr(buf) {
    const bufferView = new Uint8Array(buf);
    const len = bufferView.length;
    const str = new Array(len);

    for (let i = 0; i < len; i++) {
      str[i] = String.fromCharCode.call(null, bufferView[i]);
    }

    return str.join('');
  }

  start() {
    this.loadPlugins(); // initialize plugins

    for (const key in this._plugins) {
      const plugin = this._plugins[key];

      if (typeof plugin.onStart == 'function') {
        plugin.onStart();
      }
    }
  }

  loadPlugins() {
    // Load plugins.json
    const rootDir = Engine.engine.scene.native.assetMgr.rootDir;
    const configPath = rootDir + 'js/plugins.json';
    const hasPlugins = fs.accessSync(configPath, 0);

    if (hasPlugins) {
      const buffer = fs.readFileSync(configPath);

      if (buffer != null) {
        try {
          const content = this.bufferToStr(buffer);
          const globalConfig = JSON.parse(content); // initialize plugins based on plugins.json

          const pluginConfigs = globalConfig.plugins;

          for (const name in pluginConfigs) {
            const config = pluginConfigs[name];
            this.initPlugin(config, name);
          }
        } catch (e) {
          console.error('Failed to load plugins.json');
          console.error(e);
        }
      }
    }
  }

  initPlugin(config, name) {
    if (name.length <= 0) {
      return null;
    }

    const className = StringUtil.toPascalCase(name);

    const pluginConstructor = require(className)[className];

    const newPlugin = new pluginConstructor(); // Add to plugin map

    this._plugins[name] = newPlugin;
    newPlugin.init(Engine.engine.scene, config.config);
    return newPlugin;
  }

  update(deltaTime) {
    for (const key in this._plugins) {
      const plugin = this._plugins[key];

      if (typeof plugin.onUpdate === 'function') {
        plugin.onUpdate(deltaTime);
      }
    }
  }

  lateUpdate(deltaTime) {
    for (const key in this._plugins) {
      const plugin = this._plugins[key];

      if (typeof plugin.onLateUpdate === 'function') {
        plugin.onLateUpdate(deltaTime);
      }
    }
  }

  destroy() {
    for (const key in this._plugins) {
      const plugin = this._plugins[key];

      if (typeof plugin.onDestroy === 'function') {
        plugin.onDestroy();
      }
    }
  }

  event(event) {
    for (const key in this._plugins) {
      const plugin = this._plugins[key];

      if (typeof plugin.onEvent === 'function') {
        this._plugins[key].onEvent(event);
      }
    }
  }

  get plugins() {
    return this._plugins;
  }

}

/**
 * @class
 * @category Core
 * @name Asset
 * @classdesc Asset class for asset data.
 * @hideconstructor
 * @sdk 9.8.0
 */

/**
 * @name Asset#name
 * @type {string}
 * @description Asset's name.
 * @sdk 9.8.0
 */

/**
 * @name Asset#resource
 * @type {any}
 * @description Engine's resource (e.g texture, image, xshader...).
 * @sdk 9.8.0
 */
class Asset {
  constructor(name, resource) {
    this.name = name;
    this.resource = resource;
  }

}

/**
 * @class
 * @category Core
 * @name AssetRegistry
 * @classdesc Class to load and store all the assets used by the engine.
 * @example
 * // use assetRegistry to load a {@link Asset}
 * engine.assets.loadBundle('asset.zip', bundleLoad);
 * @hideconstructor
 * @sdk 9.8.0
 */

class AssetRegistry {
  constructor(engine) {
    this._engine = engine;
  }
  /**
   * @function
   * @name AssetRegistry#destroy
   * @description Destroy the asset registry.
   * @sdk 9.8.0
   */


  destroy() {
    return;
  }
  /**
   * @name AssetRegistry#rootDir
   * @type {string}
   * @description get the root directory of the current sticker [read only]
   * @sdk 9.8.0
   */


  get rootDir() {
    return this._engine.scene.native.assetMgr.rootDir;
  }
  /**
   * @function
   * @name AssetRegistry#loadSync
   * @returns {any} loaded asset object
   * @description load an asset from the specified path (synchronized)
   * @param {string} uri the uri for the asset it could be file path or asset uri
   * @example
   * // loading a mesh {@link Asset}
   * engine.assets.loadSync('robot.mesh');
   * // loading a custom asset with uri
   * engine.assets.loadSync('custom://123456');
   * @sdk 9.8.0
   */


  loadSync(uri) {
    // check asset existence first to void assertion in debug mode
    if (!uri.startsWith('share://') && !uri.startsWith('custom://')) {
      if (!fs.accessSync(this.rootDir + uri, 0)) {
        console.error(`Cannot find asset at: ${uri}`);
        return null;
      }
    }

    let resource = this._engine.scene.native.assetMgr.SyncLoad(uri);

    if (resource) {
      if (resource instanceof Amaz.Material) {
        resource = new Material(resource);
      }

      const filename = StringUtil.getFilename(uri);
      resource = new Asset(filename, resource);
    } else {
      console.error(`Failed to load: ${uri}`);
    }

    return resource;
  }

}

/**
 * @class
 * @category Core
 * @name Engine
 * @augments EventHandler
 * @classdesc An Engine class represents the entry point for all the rendering
 * capabilities and manages all the modules.
 * @description Constructor to create an engine instance.
 * @param {Element} canvas - The canvas element.
 * @param {object} options - Options to create engine.
 * @param {TouchDevice} [options.touch] - TouchDevice to handle the touch events.
 * @hideconstructor
 * @sdk 9.8.0
 */

/**
 * @name Engine#engine
 * @type {Engine}
 * @static
 * @description The current Engine instance.
 * @readonly
 * @sdk 9.8.0
 */

/**
 * @name Engine#scene
 * @type {Scene}
 * @description The current scene.
 * @readonly
 * @sdk 9.8.0
 */

/**
 * @name Engine#touch
 * @type {TouchDevice}
 * @description The touch device to handle the touch events.
 * @readonly
 * @sdk 9.8.0
 */

class Engine extends EventHandler {
  constructor(scene) {
    super();
    this._scene = new Scene(scene);
    this._assets = new AssetRegistry(this);
    this._customAssets = new CustomAssetRegistry();
    const out = scene.getOutputRenderTexture();
    this._touch = new TouchDevice(out.width, out.height);
    this._plugins = new PluginRegistry();
    Engine._engine = this;
  }

  static get engine() {
    return Engine._engine;
  }

  get scene() {
    return this._scene;
  }

  get customAssets() {
    return this._customAssets;
  }

  get touch() {
    return this._touch;
  }

  get assets() {
    return this._assets;
  }

  static init(scene) {
    if (Engine.engine) {
      console.warn('Engine already initialized');
      return;
    }

    Engine._engine = new Engine(scene);

    Engine._engine.initModules();
  }

  initModules() {
    Segmentation.getInstance().init();
    Head.getInstance().init();
    Hand.getInstance().init();
    Body2D.getInstance().init();
    Body3D.getInstance().init();
    AvatarDrive.getInstance().init(); // CustomAssetRegistry relies on algorithm wrappers

    this._customAssets.init();
  }
  /**
   * @function
   * @name Engine#start
   * @description Start the engine. This function does the following:
   * <ul style="list-style: none;">
   * <li>Initialize all the modules and plugins
   * <li>Fires an event named 'start'
   * </ul>
   * @sdk 9.8.0
   */


  start() {
    this._touch.start();

    this._customAssets.start();

    this._plugins.start();

    const plugins = this._plugins.plugins;

    for (const key in plugins) {
      this[key] = plugins[key];
    }

    this.fire('start');
  }
  /**
   * @param deltaTime
   * @function
   * @name Engine#update
   * @description Call update for all modules and plugins.
   * @sdk 9.8.0
   */


  update(deltaTime) {
    Segmentation.getInstance().onUpdate(deltaTime);
    Head.getInstance().onUpdate();
    Hand.getInstance().onUpdate();
    Body2D.getInstance().onUpdate();
    Body3D.getInstance().onUpdate();
    AvatarDrive.getInstance().onUpdate();

    this._customAssets.update(deltaTime);

    this._plugins.update(deltaTime);
  }
  /**
   * @param deltaTime
   * @function
   * @name Engine#lateUpdate
   * @description Call lateUpdate for all modules and plugins.
   * @sdk 9.8.0
   */


  lateUpdate(deltaTime) {
    this._customAssets.lateUpdate(deltaTime);

    this._plugins.lateUpdate(deltaTime);
  }
  /**
   * @function
   * @name Engine#destroy
   * @description Destroy the engine instance and clean up all the resources.
   * @sdk 9.8.0
   */


  destroy() {
    this._plugins.destroy();

    this._customAssets.destroy();

    this._assets.destroy();

    if (this._touch) {
      this._touch.destroy();
    }

    if (this._scene) {
      this._scene.destroy();
    }

    Engine._engine = undefined;
  }
  /**
   * @param event
   * @function
   * @name Engine#event
   * @description Call event for all modules and plugins.
   * @sdk 9.8.0
   */


  event(event) {
    if (this._touch) {
      this._touch.onEvent(event);
    }

    this._plugins.event(event);
  }

}

/**
 * @class
 * @category Core
 * @name Gyroscope
 * @augments EventHandler
 * @classdesc Gyroscope class for motion events from device's motion sensor.
 * @description Constructor to create the Gyroscope instance.
 * To add an Gyroscope to {@link Engine},
 * @param {object} options - Options for update gyroscope data.
 * @param {number} options.interval - The update interval. Default 50ms.
 * @example
 * // Add Gyroscope to engine.
 * const gyro = new amg.Gyroscope(options);
 * const engine = new amg.Engine(canvas, { touch, gyro });
 * gyro.on('change', function (gyroData) {
 *   console.log(gyroData);
 * });
 * @sdk 9.8.0
 */

class Gyroscope extends EventHandler {
  constructor() {
    super();
    this.hasGyroStarted = false;
    this.hasGyroStarted = false;
  }

  destroy() {// stop and remove all event hooks
    // stopGyroscope();
  }
  /**
   * @event
   * @name Gyroscope#change
   * @description Fired when gyroscope was changed.
   * @param {GyroData} gyroData - Gyroscope data.
   * @example
   * gyro.on('change', function (gyroData) {
   *     console.log(gyroData);
   * });
   * @sdk 9.8.0
   */


  start() {
    this.hasGyroStarted = true; // startGyroscope({
    //   interval: this.interval,
    //   fail: () => {
    //     console.log('Failed to start gyroscope.');
    //     this.hasGyroStarted = false;
    //   },
    // });
    // if (this.hasGyroStarted) {
    //   onGyroscopeChange((param: any) => {
    //     if (param.result >= 0) {
    //       const deviceAngularVelocity = new Vec3(param.x, param.y, param.z);
    //       const deviceRotationAngles = new Vec3(
    //         param.pitch,
    //         param.roll,
    //         param.yaw
    //       );
    //       const timeStamp = param.t;
    //       deviceRotationAngles.mul(RAD2DEG);
    //       deviceAngularVelocity.mul(RAD2DEG);
    //       this.fire(
    //         'change',
    //         new GyroData(timeStamp, deviceRotationAngles, deviceAngularVelocity)
    //       );
    //     } else {
    //       console.warn('Invalid gyro data.');
    //     }
    //   });
    // }
  }
  /**
   * @name Gyroscope#hasStarted
   * @type {boolean}
   * @description Check if gyroscope has started.
   * @readonly
   * @sdk 9.8.0
   */


  get hasStarted() {
    return this.hasGyroStarted;
  }

}

/**
 * @class
 * @category Core
 * @name Mesh
 * @classdesc Mesh class 3d mesh.
 * @description Constructor to create an Mesh instance.
 * @sdk 9.8.0
 */

var Mesh = Amaz.Mesh;
/**
 * @function
 * @static
 * @name Mesh.calculateTangents
 * @description Calculate mesh's tangents.
 * @param {Array<Vec3>} positions - Vertices' positions.
 * @param {Array<Vec3>} normals - Vertices' normals.
 * @param {Array<Vec2>} uvs - Vertices' texture coordinates.
 * @param {Array<number>} indices - Array of vertex indices.
 * @returns {Array<Vec4>} Array of tangents.
 * @sdk 9.8.0
 */

Mesh.calculateTangents = function (positions, normals, uvs, indices) {
  const tangents = [];
  const triangleCount = indices.length / 3;
  const vertexCount = positions.length;
  const tan1 = new Float32Array(vertexCount * 3);
  const tan2 = new Float32Array(vertexCount * 3);

  for (let i = 0; i < triangleCount; ++i) {
    const i1 = indices[i * 3];
    const i2 = indices[i * 3 + 1];
    const i3 = indices[i * 3 + 2];
    const v1 = positions[i1];
    const v2 = positions[i2];
    const v3 = positions[i3];
    const w1 = uvs[i1];
    const w2 = uvs[i2];
    const w3 = uvs[i3];
    const x1 = v2.x - v1.x;
    const x2 = v3.x - v1.x;
    const y1 = v2.y - v1.y;
    const y2 = v3.y - v1.y;
    const z1 = v2.z - v1.z;
    const z2 = v3.z - v1.z;
    const s1 = w2.x - w1.x;
    const s2 = w3.x - w1.x;
    const t1 = w2.y - w1.y;
    const t2 = w3.y - w1.y;
    const area = s1 * t2 - s2 * t1;
    const sdir = new Vec3();
    const tdir = new Vec3(); // Area can 0.0 for degenerate triangles or bad uv coordinates

    if (area === 0.0) {
      // Fallback to default values
      sdir.set(0.0, 1.0, 0.0);
      tdir.set(1.0, 0.0, 0.0);
    } else {
      const r = 1.0 / area;
      sdir.set((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
      tdir.set((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);
    }

    tan1[i1 * 3 + 0] += sdir.x;
    tan1[i1 * 3 + 1] += sdir.y;
    tan1[i1 * 3 + 2] += sdir.z;
    tan1[i2 * 3 + 0] += sdir.x;
    tan1[i2 * 3 + 1] += sdir.y;
    tan1[i2 * 3 + 2] += sdir.z;
    tan1[i3 * 3 + 0] += sdir.x;
    tan1[i3 * 3 + 1] += sdir.y;
    tan1[i3 * 3 + 2] += sdir.z;
    tan2[i1 * 3 + 0] += tdir.x;
    tan2[i1 * 3 + 1] += tdir.y;
    tan2[i1 * 3 + 2] += tdir.z;
    tan2[i2 * 3 + 0] += tdir.x;
    tan2[i2 * 3 + 1] += tdir.y;
    tan2[i2 * 3 + 2] += tdir.z;
    tan2[i3 * 3 + 0] += tdir.x;
    tan2[i3 * 3 + 1] += tdir.y;
    tan2[i3 * 3 + 2] += tdir.z;
  }

  const temp = new Vec3();
  const tangent = new Vec4();

  for (let i = 0; i < vertexCount; ++i) {
    const n = normals[i];
    const t1 = new Vec3(tan1[i * 3], tan1[i * 3 + 1], tan1[i * 3 + 2]);
    const t2 = new Vec3(tan2[i * 3], tan2[i * 3 + 1], tan2[i * 3 + 2]); // Gram-Schmidt orthogonalize

    const ndott = n.dot(t1);
    temp.set(n.x, n.y, n.z);
    temp.scale(new Vec3(ndott, ndott, ndott));
    temp.subtract(t1, temp).normalize();
    tangent.x = temp.x;
    tangent.y = temp.y;
    tangent.z = temp.z; // Calculate handedness

    temp.cross2(n, t1);
    tangent.w = temp.dot(t2) < 0.0 ? -1.0 : 1.0;
    tangents.push(tangent.clone());
  }

  return tangents;
};
/**
 * @function
 * @static
 * @name Mesh.buildPlane
 * @description Build plane mesh data.
 * @param {'x' | 'y' | 'z'} u Plane's component X.
 * @param {'x' | 'y' | 'z'} v Plane's component Y.
 * @param {'x' | 'y' | 'z'} w Plane's component Z.
 * @param {number} udir Plane's direction X.
 * @param {number} vdir Plane's direction Y.
 * @param {number} width Plane's width.
 * @param {number} height Plane's height.
 * @param {number} depth Plane's depth.
 * @param {number} gridX Plane's grid size X.
 * @param {number} gridY Plane's grid size Y.
 * @param {boolean} withTangents Generate tangent flag.
 * @returns {object} Mesh data.
 * <table>
 *  <tr><td>positions</td><td>Vec3[]</td></tr>
 *  <tr><td>normals</td><td>Vec3[]</td></tr>
 *  <tr><td>uvs</td><td>Vec2[]</td></tr>
 *  <tr><td>tangents</td><td>Vec4[]</td></tr>
 *  <tr><td>indices</td><td>number[]</td></tr>
 * </table>
 * @sdk 9.8.0
 */


function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, withTangents = false) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const oneOverGridX = 1.0 / gridX;
  const oneOverGridY = 1.0 / gridY;
  const segmentWidth = width * oneOverGridX;
  const segmentHeight = height * oneOverGridY;
  const widthHalf = width * 0.5;
  const heightHalf = height * 0.5;
  const depthHalf = depth * 0.5;
  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;
  const vector = new Vec3(); // generate vertices, normals and uvs

  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segmentHeight - heightHalf;

    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segmentWidth - widthHalf; // set values to correct vector component

      vector[u] = x * udir;
      vector[v] = y * vdir;
      vector[w] = depthHalf; // set positions

      positions.push(vector.clone()); // set values to correct vector component

      vector[u] = 0;
      vector[v] = 0;
      vector[w] = depth > 0 ? 1 : -1; // set normals

      normals.push(vector.clone()); // set uvs

      uvs.push(new Vec2(ix * oneOverGridX, 1.0 - iy * oneOverGridY));
    }
  } // indices
  // 1. you need three indices to draw a single face
  // 2. a single segment consists of two faces
  // 3. so we need to generate six (2*3) indices per segment


  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = ix + 1 + gridX1 * (iy + 1);
      const d = ix + 1 + gridX1 * iy; // face 1

      indices.push(a, b, d); // face 2

      indices.push(b, c, d);
    }
  }

  const tangents = withTangents ? Mesh.calculateTangents(positions, normals, uvs, indices) : undefined;
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices
  };
}
/**
 * @function
 * @static
 * @name Mesh.createConeMeshData
 * @description Build cone mesh data.
 * @param {number} height Cone's height
 * @param {number} bottomRadius Cone's bottom radius.
 * @param {number} topRadius Cone's top radius.
 * @param {number} heightSegments Cone's height segments.
 * @param {number} capSegments Cone's cap segments.
 * @param {boolean} withTangents Generate tangent flag.
 * @returns {object} Mesh data.
 * <table>
 *  <tr><td>positions</td><td>Vec3[]</td></tr>
 *  <tr><td>normals</td><td>Vec3[]</td></tr>
 *  <tr><td>uvs</td><td>Vec2[]</td></tr>
 *  <tr><td>tangents</td><td>Vec4[]</td></tr>
 *  <tr><td>indices</td><td>number[]</td></tr>
 * </table>
 * @sdk 9.8.0
 */


function createConeMeshData(height, bottomRadius, topRadius, heightSegments, capSegments, withTangents = false) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const oneOverCapSegments = 1.0 / capSegments;
  const oneOverHeightSegments = 1.0 / heightSegments;
  const halfHeight = height * 0.5;

  if (height > 0) {
    for (let i = 0; i <= heightSegments; ++i) {
      for (let j = 0; j <= capSegments; ++j) {
        const jOverCapSegments = j * oneOverCapSegments;
        const iOverHeightSegments = i * oneOverHeightSegments;
        const theta = jOverCapSegments * 2.0 * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const bottom = new Vec3(sinTheta * bottomRadius, -halfHeight, cosTheta * bottomRadius);
        const top = new Vec3(sinTheta * topRadius, halfHeight, cosTheta * topRadius);
        const pos = new Vec3().lerp(bottom, top, iOverHeightSegments);
        const bottomToTop = new Vec3().subtract(top, bottom).normalize();
        const tangent = new Vec3(cosTheta, 0.0, -sinTheta);
        const norm = new Vec3().cross2(tangent, bottomToTop).normalize();
        positions.push(pos.clone());
        normals.push(norm.clone());
        uvs.push(new Vec2(jOverCapSegments, iOverHeightSegments));

        if (i < heightSegments && j < capSegments) {
          const p0 = i * (capSegments + 1) + j;
          const p1 = i * (capSegments + 1) + (j + 1);
          const p2 = (i + 1) * (capSegments + 1) + j;
          const p3 = (i + 1) * (capSegments + 1) + (j + 1); // create 2 faces

          indices.push(p0, p1, p2);
          indices.push(p1, p3, p2);
        }
      }
    }
  }

  const tangents = withTangents ? Mesh.calculateTangents(positions, normals, uvs, indices) : undefined;
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices
  };
}
/**
 * @function
 * @static
 * @name Mesh.createSphereMeshData
 * @description Build sphere mesh data.
 * @param {number} radius Sphere's radius.
 * @param {number} heightSegments Sphere's height segments.
 * @param {number} widthSegments Sphere's width segments.
 * @param {boolean} withTangents Generate tangent flag.
 * @param {number} heightOffset Sphere's height offset.
 * @param {'full' | 'top' | 'bottom'} options Options to build the sphere.
 * @returns {object} Mesh data.
 * <table>
 *  <tr><td>positions</td><td>Vec3[]</td></tr>
 *  <tr><td>normals</td><td>Vec3[]</td></tr>
 *  <tr><td>uvs</td><td>Vec2[]</td></tr>
 *  <tr><td>tangents</td><td>Vec4[]</td></tr>
 *  <tr><td>indices</td><td>number[]</td></tr>
 * </table>
 * @sdk 9.8.0
 */


function createSphereMeshData(radius, heightSegments, widthSegments, withTangents = false, heightOffset = 0, options = 'full') {
  const oneOverWidthSegments = 1.0 / widthSegments;
  const oneOverHeightSegments = 1.0 / heightSegments;
  const halfHeightSegments = heightSegments / 2;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = []; // options for entire sphere mesh

  const heightStart = 0;
  let heightEnd = heightSegments;
  let heightDirection = 1;

  if (options === 'top') {
    heightEnd = halfHeightSegments;
  } else if (options === 'bottom') {
    heightEnd = halfHeightSegments;
    heightDirection = -1;
  }

  for (let i = heightStart; i <= heightEnd; ++i) {
    const theta = i * Math.PI * oneOverHeightSegments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let j = 0; j <= widthSegments; ++j) {
      const phi = j * 2.0 * Math.PI * oneOverWidthSegments - Math.PI * 0.5;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const x = cosPhi * sinTheta;
      const y = heightDirection * cosTheta;
      const z = sinPhi * sinTheta;
      const u = 1.0 - j * oneOverWidthSegments;
      const v = 1.0 - i * oneOverHeightSegments;
      positions.push(new Vec3(x * radius, heightOffset + y * radius, z * radius));
      normals.push(new Vec3(x, y, z));
      uvs.push(new Vec2(u, v));
    }
  }

  for (let i = heightStart; i < heightEnd; ++i) {
    for (let j = 0; j < widthSegments; ++j) {
      const first = i * (widthSegments + 1) + j;
      const second = first + widthSegments + 1;

      if (heightDirection > 0) {
        indices.push(first + 1, second, first);
        indices.push(first + 1, second + 1, second);
      } else {
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
  }

  const tangents = withTangents ? Mesh.calculateTangents(positions, normals, uvs, indices) : undefined;
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices
  };
}
/**
 * @function
 * @static
 * @name Mesh.createCircleMeshData
 * @description Build circle mesh data.
 * @param {number} radius Circle's radius.
 * @param {number} segments Circle's segments.
 * @param {number} heightOffset Circle's height offset.
 * @param {boolean} withTangents Generate tangent flag.
 * @returns {object} Mesh data.
 * <table>
 *  <tr><td>positions</td><td>Vec3[]</td></tr>
 *  <tr><td>normals</td><td>Vec3[]</td></tr>
 *  <tr><td>uvs</td><td>Vec2[]</td></tr>
 *  <tr><td>tangents</td><td>Vec4[]</td></tr>
 *  <tr><td>indices</td><td>number[]</td></tr>
 * </table>
 * @sdk 9.8.0
 */


function createCircleMeshData(radius, segments, heightOffset = 0, withTangents = false) {
  const oneOverSegments = 1.0 / segments;
  const direction = heightOffset >= 0.0 ? 1.0 : -1.0;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  if (radius > 0.0) {
    for (let i = 0; i < segments; ++i) {
      const theta = i * oneOverSegments * 2.0 * Math.PI;
      const x = Math.sin(theta);
      const y = heightOffset;
      const z = Math.cos(theta);
      const u = 1.0 - (x + 1.0) * 0.5;
      const v = (z + 1.0) * 0.5;
      positions.push(new Vec3(x * radius, y, z * radius));
      normals.push(new Vec3(0.0, direction, 0.0));
      uvs.push(new Vec2(u, v));

      if (i > 1) {
        if (direction > 0) {
          indices.push(i - 1, i, 0);
        } else {
          indices.push(0, i, i - 1);
        }
      }
    }
  }

  const tangents = withTangents ? Mesh.calculateTangents(positions, normals, uvs, indices) : undefined;
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices
  };
}
/**
 * @function
 * @static
 * @name Mesh.createMesh
 * @description Create mesh instance.
 * @param {object[]} parts A list of part objects.
 * <table>
 *  <tr><td>positions</td><td>Vec3[]</td></tr>
 *  <tr><td>normals</td><td>Vec3[]</td></tr>
 *  <tr><td>uvs</td><td>Vec2[]</td></tr>
 *  <tr><td>tangents</td><td>Vec4[]</td></tr>
 *  <tr><td>indices</td><td>number[]</td></tr>
 * </table>
 * @param {AABB} aabb Mesh's bouding box.
 * @param {boolean} withTangents Generate tangent flag.
 * @param {boolean} withColors With color flag.
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.createMesh = function (parts, aabb, withTangents = false, withColors = false) {
  // buffers
  const vertices = new Amaz.FloatVector();
  const indices = new Amaz.UInt16Vector();
  let indexStart = 0;

  for (const part of parts) {
    const count = part.positions.length;

    for (let i = 0; i < count; ++i) {
      vertices.pushBack(part.positions[i].x);
      vertices.pushBack(part.positions[i].y);
      vertices.pushBack(part.positions[i].z);
      vertices.pushBack(part.normals[i].x);
      vertices.pushBack(part.normals[i].y);
      vertices.pushBack(part.normals[i].z);
      vertices.pushBack(part.uvs[i].x);
      vertices.pushBack(part.uvs[i].y);

      if (withTangents) {
        vertices.pushBack(part.tangents[i].x);
        vertices.pushBack(part.tangents[i].y);
        vertices.pushBack(part.tangents[i].z);
        vertices.pushBack(part.tangents[i].w);
      }

      if (withColors) {
        vertices.pushBack(part.colors[i].r);
        vertices.pushBack(part.colors[i].g);
        vertices.pushBack(part.colors[i].b);
        vertices.pushBack(part.colors[i].a);
      }
    }

    for (const index of part.indices) {
      indices.pushBack(indexStart + index);
    }

    indexStart += count;
  } // create mesh


  const mesh = new Mesh();
  mesh.boundingBox = aabb;
  mesh.vertices = vertices; // create vertex attribute structure

  const vertexAttribs = new Amaz.Vector();
  const posDesc = new Amaz.VertexAttribDesc();
  posDesc.semantic = Amaz.VertexAttribType.POSITION;
  vertexAttribs.pushBack(posDesc);
  const normalDesc = new Amaz.VertexAttribDesc();
  normalDesc.semantic = Amaz.VertexAttribType.NORMAL;
  vertexAttribs.pushBack(normalDesc);
  const uvDesc = new Amaz.VertexAttribDesc();
  uvDesc.semantic = Amaz.VertexAttribType.TEXCOORD0;
  vertexAttribs.pushBack(uvDesc);

  if (withTangents) {
    const tangentDesc = new Amaz.VertexAttribDesc();
    tangentDesc.semantic = Amaz.VertexAttribType.TANGENT;
    vertexAttribs.pushBack(tangentDesc);
  }

  if (withColors) {
    const colorDesc = new Amaz.VertexAttribDesc();
    colorDesc.semantic = Amaz.VertexAttribType.COLOR;
    vertexAttribs.pushBack(colorDesc);
  }

  mesh.vertexAttribs = vertexAttribs; // create submesh

  const subMesh = new Amaz.SubMesh();
  subMesh.indices16 = indices;
  subMesh.primitive = Amaz.Primitive.TRIANGLES;
  subMesh.boundingBox = aabb;
  mesh.addSubMesh(subMesh);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.box
 * @description Create box mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>halfExtents</td><td>Vec3</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.box = function (options) {
  const halfExtents = options && options.halfExtents !== undefined ? options.halfExtents : new Vec3(0.5, 0.5, 0.5);
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const width = halfExtents.x * 2.0;
  const height = halfExtents.y * 2.0;
  const depth = halfExtents.z * 2.0;
  const widthSegments = 1.0;
  const heightSegments = 1.0;
  const depthSegments = 1.0;
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const halfDepth = depth * 0.5; // build each side of the box geometry

  const rightFace = buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, withTangents);
  const leftFace = buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, withTangents);
  const topFace = buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, withTangents);
  const bottomFace = buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, withTangents);
  const frontFace = buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, withTangents);
  const backFace = buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, withTangents);
  const aabb = new Amaz.AABB();
  aabb.min_x = -halfWidth;
  aabb.min_y = -halfHeight;
  aabb.min_z = -halfDepth;
  aabb.max_x = halfWidth;
  aabb.max_y = halfHeight;
  aabb.max_z = halfDepth;
  const faces = [rightFace, leftFace, topFace, bottomFace, frontFace, backFace];
  const mesh = Mesh.createMesh(faces, aabb, withTangents);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.cylinder
 * @description Create cylinder mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>radius</td><td>number</td></tr>
 *  <tr><td>height</td><td>number</td></tr>
 *  <tr><td>heightSegments</td><td>number</td></tr>
 *  <tr><td>capSegments</td><td>number</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.cylinder = function (options) {
  const radius = options && options.radius !== undefined ? options.radius : 0.5;
  const height = options && options.height !== undefined ? options.height : 1.0;
  const heightSegments = options && options.heightSegments !== undefined ? options.heightSegments : 5;
  const capSegments = options && options.capSegments !== undefined ? options.capSegments : 20;
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const aabb = new Amaz.AABB();
  aabb.min_x = -radius;
  aabb.min_y = -height * 0.5;
  aabb.min_z = -radius;
  aabb.max_x = radius;
  aabb.max_y = height * 0.5;
  aabb.max_z = radius;
  const bottomCap = createCircleMeshData(radius, capSegments, -height * 0.5, withTangents);
  const cone = createConeMeshData(height, radius, radius, heightSegments, capSegments, withTangents);
  const topCap = createCircleMeshData(radius, capSegments, height * 0.5, withTangents);
  const mesh = Mesh.createMesh([bottomCap, cone, topCap], aabb, withTangents);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.cone
 * @description Create cone mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>bottomRadius</td><td>number</td></tr>
 *  <tr><td>topRadius</td><td>number</td></tr>
 *  <tr><td>heightSegments</td><td>number</td></tr>
 *  <tr><td>capSegments</td><td>number</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.cone = function (options) {
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const bottomRadius = options && options.bottomRadius !== undefined ? options.bottomRadius : 0.5;
  const topRadius = options && options.topRadius !== undefined ? options.topRadius : 0.0;
  const height = options && options.height !== undefined ? options.height : 1.0;
  const heightSegments = options && options.heightSegments !== undefined ? options.heightSegments : 5;
  const capSegments = options && options.capSegments !== undefined ? options.capSegments : 20;
  const maxRadius = Math.max(bottomRadius, topRadius);
  const aabb = new Amaz.AABB();
  aabb.min_x = -maxRadius;
  aabb.min_y = -height * 0.5;
  aabb.min_z = -maxRadius;
  aabb.max_x = maxRadius;
  aabb.max_y = -height * 0.5;
  aabb.max_z = maxRadius;
  const bottomCap = createCircleMeshData(bottomRadius, capSegments, -height * 0.5, withTangents);
  const cone = createConeMeshData(height, bottomRadius, topRadius, heightSegments, capSegments, withTangents);
  const topCap = topRadius > 0 ? createCircleMeshData(topRadius, capSegments, height * 0.5, withTangents) : undefined;
  const parts = topRadius > 0 ? [bottomCap, cone, topCap] : [bottomCap, cone];
  const mesh = Mesh.createMesh(parts, aabb, withTangents);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.plane
 * @description Create plane mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>width</td><td>number</td></tr>
 *  <tr><td>length</td><td>number</td></tr>
 *  <tr><td>widthSegments</td><td>number</td></tr>
 *  <tr><td>lengthSegments</td><td>number</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.plane = function (options) {
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const width = options && options.width !== undefined ? options.width : 1.0;
  const length = options && options.length !== undefined ? options.length : 1.0;
  const widthSegments = options && options.widthSegments !== undefined ? options.widthSegments : 5;
  const lengthSegments = options && options.lengthSegments !== undefined ? options.lengthSegments : 5;
  const halfWidth = width * 0.5;
  const halfLength = length * 0.5;
  const aabb = new Amaz.AABB();
  aabb.min_x = -halfWidth;
  aabb.min_y = 0.0;
  aabb.min_z = -halfLength;
  aabb.max_x = halfWidth;
  aabb.max_y = 0.0;
  aabb.max_z = halfLength; // build each side of the box geometry

  const plane = buildPlane('x', 'z', 'y', 1, 1, width, length, 0, widthSegments, lengthSegments, withTangents);
  const mesh = Mesh.createMesh([plane], aabb, withTangents);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.sphere
 * @description Create sphere mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>radius</td><td>number</td></tr>
 *  <tr><td>widthSegments</td><td>number</td></tr>
 *  <tr><td>heightSegments</td><td>number</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.sphere = function (options) {
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const radius = options && options.radius !== undefined ? options.radius : 0.5;
  const widthSegments = options && options.widthSegments !== undefined ? options.widthSegments : 16;
  const heightSegments = options && options.heightSegments !== undefined ? options.heightSegments : 16;
  const aabb = new Amaz.AABB();
  aabb.min_x = -radius;
  aabb.min_y = -radius;
  aabb.min_z = -radius;
  aabb.max_x = radius;
  aabb.max_y = radius;
  aabb.max_z = radius;
  const meshData = createSphereMeshData(radius, widthSegments, heightSegments, withTangents);
  const mesh = Mesh.createMesh([meshData], aabb, withTangents);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.capsule
 * @description Create capsule mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>radius</td><td>number</td></tr>
 *  <tr><td>height</td><td>number</td></tr>
 *  <tr><td>heightSegments</td><td>number</td></tr>
 *  <tr><td>capSegments</td><td>number</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.capsule = function (options) {
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const radius = options && options.radius !== undefined ? options.radius : 0.5;
  const height = options && options.height !== undefined ? options.height : 1.0;
  const heightSegments = options && options.heightSegments !== undefined ? options.heightSegments : 5;
  const capSegments = options && options.capSegments !== undefined ? options.capSegments : 20;
  const aabb = new Amaz.AABB();
  aabb.min_x = -radius;
  aabb.min_y = -height * 0.5 - radius;
  aabb.min_z = -radius;
  aabb.max_x = radius;
  aabb.max_y = height * 0.5 + radius;
  aabb.max_z = radius;
  const cone = createConeMeshData(height, radius, radius, heightSegments, capSegments, withTangents);
  const top = createSphereMeshData(radius, capSegments, capSegments, withTangents, height * 0.5, 'top');
  const bottom = createSphereMeshData(radius, capSegments, capSegments, withTangents, -height * 0.5, 'bottom');
  const mesh = Mesh.createMesh([bottom, cone, top], aabb, withTangents);
  return mesh;
};
/**
 * @function
 * @static
 * @name Mesh.torus
 * @description Create torus mesh.
 * @param {object} options Options to create mesh.
 * <table>
 *  <tr><td>tubeRadius</td><td>number</td></tr>
 *  <tr><td>ringRadius</td><td>number</td></tr>
 *  <tr><td>ringSegments</td><td>number</td></tr>
 *  <tr><td>tubeSegments</td><td>number</td></tr>
 *  <tr><td>withTangents</td><td>boolean</td></tr>
 * </table>
 * @returns {Mesh} Mesh instance.
 * @sdk 9.8.0
 */


Mesh.torus = function (options) {
  const withTangents = options && options.withTangents !== undefined ? options.withTangents : false;
  const tubeRadius = options && options.tubeRadius !== undefined ? options.tubeRadius : 0.2;
  const ringRadius = options && options.ringRadius !== undefined ? options.ringRadius : 0.3;
  const ringSegments = options && options.ringSegments !== undefined ? options.ringSegments : 20;
  const tubeSegments = options && options.tubeSegments !== undefined ? options.tubeSegments : 20;
  const halfExent = tubeRadius + ringRadius;
  const oneOverRingSegments = 1.0 / ringSegments;
  const oneOverTubeSegment = 1.0 / tubeSegments;
  const aabb = new Amaz.AABB();
  aabb.min_x = -halfExent;
  aabb.min_y = -tubeRadius;
  aabb.min_z = -halfExent;
  aabb.max_x = halfExent;
  aabb.max_y = tubeRadius;
  aabb.max_z = halfExent;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= ringSegments; ++i) {
    const iOverRingSegments = i * oneOverRingSegments;

    for (let j = 0; j <= tubeSegments; ++j) {
      const jOverTubeSegment = j * oneOverTubeSegment;
      const cosI = Math.cos(2.0 * Math.PI * iOverRingSegments);
      const cosJ = Math.cos(2.0 * Math.PI * jOverTubeSegment);
      const sinI = Math.sin(2.0 * Math.PI * iOverRingSegments);
      const sinJ = Math.sin(2.0 * Math.PI * jOverTubeSegment);
      const x = cosJ * (ringRadius + tubeRadius * cosI);
      const y = sinI * tubeRadius;
      const z = sinJ * (ringRadius + tubeRadius * cosI);
      const nx = cosJ * cosI;
      const ny = sinI;
      const nz = sinJ * cosI;
      const u = iOverRingSegments;
      const v = 1.0 - jOverTubeSegment;
      positions.push(new Vec3(x, y, z));
      normals.push(new Vec3(nx, ny, nz));
      uvs.push(new Vec2(u, v));

      if (i < ringSegments && j < tubeSegments) {
        const first = i * (tubeSegments + 1) + j;
        const second = (i + 1) * (tubeSegments + 1) + j;
        const third = i * (tubeSegments + 1) + (j + 1);
        const fourth = (i + 1) * (tubeSegments + 1) + (j + 1);
        indices.push(first, second, third);
        indices.push(second, fourth, third);
      }
    }
  }

  const tangents = withTangents ? Mesh.calculateTangents(positions, normals, uvs, indices) : undefined;
  const mesh = Mesh.createMesh([{
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices
  }], aabb, withTangents);
  return mesh;
};

/**
 * @class
 * @category Core
 * @name XShader
 * @classdesc Material class to store shader and its attributes.
 * @description Constructor to create XShader instance.
 * @param {object} options Options to create XShader.
 * <table>
 *  <tr><td>attributes</td><td>[key: string]: number</td></tr>
 *  <tr><td>vshader</td><td>string</td></tr>
 *  <tr><td>fshader</td><td>string</td></tr>
 * </table>
 * @sdk 9.8.0
 */

class XShader {
  constructor(options) {
    if (!options.attributes) {
      throw new Error('No shader attributes found!');
    }

    if (!options.vshader) {
      throw new Error('No vertex shader found!');
    }

    if (!options.fshader) {
      throw new Error('No fragment shader found!');
    }

    const semantics = new Amaz.Map();

    for (const key in options.attributes) {
      semantics.insert(key, options.attributes[key]);
    }

    const vs = new Amaz.Shader();
    vs.type = Amaz.ShaderType.VERTEX;
    vs.source = options.vshader;
    const fs = new Amaz.Shader();
    fs.type = Amaz.ShaderType.FRAGMENT;
    fs.source = options.fshader;
    const shaderVec = new Amaz.Vector();
    shaderVec.pushBack(vs);
    shaderVec.pushBack(fs);
    const shaderMap = new Amaz.Map();
    shaderMap.insert('gles2', shaderVec);
    const renderState = new Amaz.RenderState();
    renderState.depthstencil = new Amaz.DepthStencilState();
    renderState.depthstencil.depthTestEnable = true;
    renderState.depthstencil.depthWriteEnable = true;
    renderState.depthstencil.stencilTestEnable = false;
    renderState.depthstencil.depthCompareOp = Amaz.CompareOp.LESS;
    const rasterState = new Amaz.RasterizationState();
    renderState.rasterization = rasterState;
    rasterState.cullMode = Amaz.CullFace.BACK;
    const attachment = new Amaz.ColorBlendAttachmentState();
    attachment.srcColorBlendFactor = Amaz.BlendFactor.SRC_ALPHA;
    attachment.dstColorBlendFactor = Amaz.BlendFactor.ONE_MINUS_SRC_ALPHA;
    attachment.srcAlphaBlendFactor = Amaz.BlendFactor.ONE;
    attachment.dstAlphaBlendFactor = Amaz.BlendFactor.ONE;
    attachment.colorWriteMask = 15;
    attachment.ColorBlendOp = Amaz.BlendOp.ADD;
    attachment.AlphaBlendOp = Amaz.BlendOp.ADD;
    attachment.blendEnable = true;
    const attachments = new Amaz.Vector();
    attachments.pushBack(attachment);
    const colorBlend = new Amaz.ColorBlendState();
    colorBlend.attachments = attachments;
    renderState.colorBlend = colorBlend;
    const pass = new Amaz.Pass();
    pass.semantics = semantics;
    pass.shaders = shaderMap;
    pass.renderState = renderState;
    const passes = new Amaz.Vector();
    passes.pushBack(pass);
    this.native = new Amaz.XShader();
    this.native.passes = passes;
  }

}

/**
 * @class
 * @category Core
 * @name Script
 * @classdesc Class for base script component.
 * @hideconstructor
 * @sdk 10.1.0
 */

class Script {
  onInit() {
    //TODO: replace Scene
    this.sce = Engine.engine.scene;
    this.entity = this.sce.entityFromNative(this.entity);
    this.engine = Engine.engine;
  }

}

/**
 * @class
 * @category Math
 * @name Mat3
 * @classdesc Class for math matrix 3x3.
 * @description Constructor to create an Mat3 instance.
 * @param {number} m0 - 1st element of the matrix.
 * @param {number} m1 - 2nd element of the matrix.
 * @param {number} m2 - 3rd element of the matrix.
 * @param {number} m3 - 4th element of the matrix.
 * @param {number} m4 - 5th element of the matrix.
 * @param {number} m5 - 6th element of the matrix.
 * @param {number} m6 - 7th element of the matrix.
 * @param {number} m7 - 8th element of the matrix.
 * @param {number} m8 - 9th element of the matrix.
 * @sdk 9.8.0
 */

var Mat3 = Amaz.Matrix3x3f;

/**
 * @class
 * @category Math
 * @name Rect
 * @classdesc Class for math rectangle.
 * @description Constructor to create an Rect instance.
 * @param {number} x - x.
 * @param {number} y - y.
 * @param {number} width - width.
 * @param {number} height - height.
 * @sdk 9.8.0
 */

var Rect = Amaz.Rect;

/**
 * @class
 * @category Math
 * @name AABB
 * @classdesc Class for axis-aligned bounding boxes.
 * @description Constructor to create an AABB instance.
 * @param {Vec3} min - Min position.
 * @param {Vec3} max - Max position.
 * @sdk 9.8.0
 */

var AABB = Amaz.AABB;

/**
 * @param positions
 * @param normals
 * @param uvs
 * @param indices
 */

function calculateTangents(positions, normals, uvs, indices) {
  const tangents = [];
  const triangleCount = indices.length / 3;
  const vertexCount = positions.length;
  const tan1 = new Float32Array(vertexCount * 3);
  const tan2 = new Float32Array(vertexCount * 3);

  for (let i = 0; i < triangleCount; ++i) {
    const i1 = indices[i * 3];
    const i2 = indices[i * 3 + 1];
    const i3 = indices[i * 3 + 2];
    const v1 = positions[i1];
    const v2 = positions[i2];
    const v3 = positions[i3];
    const w1 = uvs[i1];
    const w2 = uvs[i2];
    const w3 = uvs[i3];
    const x1 = v2.x - v1.x;
    const x2 = v3.x - v1.x;
    const y1 = v2.y - v1.y;
    const y2 = v3.y - v1.y;
    const z1 = v2.z - v1.z;
    const z2 = v3.z - v1.z;
    const s1 = w2.x - w1.x;
    const s2 = w3.x - w1.x;
    const t1 = w2.y - w1.y;
    const t2 = w3.y - w1.y;
    const area = s1 * t2 - s2 * t1;
    const sdir = new Vec3();
    const tdir = new Vec3(); // Area can 0.0 for degenerate triangles or bad uv coordinates

    if (area === 0.0) {
      // Fallback to default values
      sdir.set(0.0, 1.0, 0.0);
      tdir.set(1.0, 0.0, 0.0);
    } else {
      const r = 1.0 / area;
      sdir.set((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
      tdir.set((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);
    }

    tan1[i1 * 3 + 0] += sdir.x;
    tan1[i1 * 3 + 1] += sdir.y;
    tan1[i1 * 3 + 2] += sdir.z;
    tan1[i2 * 3 + 0] += sdir.x;
    tan1[i2 * 3 + 1] += sdir.y;
    tan1[i2 * 3 + 2] += sdir.z;
    tan1[i3 * 3 + 0] += sdir.x;
    tan1[i3 * 3 + 1] += sdir.y;
    tan1[i3 * 3 + 2] += sdir.z;
    tan2[i1 * 3 + 0] += tdir.x;
    tan2[i1 * 3 + 1] += tdir.y;
    tan2[i1 * 3 + 2] += tdir.z;
    tan2[i2 * 3 + 0] += tdir.x;
    tan2[i2 * 3 + 1] += tdir.y;
    tan2[i2 * 3 + 2] += tdir.z;
    tan2[i3 * 3 + 0] += tdir.x;
    tan2[i3 * 3 + 1] += tdir.y;
    tan2[i3 * 3 + 2] += tdir.z;
  }

  const temp = new Vec3();
  const tangent = new Vec4();

  for (let i = 0; i < vertexCount; ++i) {
    const n = normals[i];
    const t1 = new Vec3(tan1[i * 3], tan1[i * 3 + 1], tan1[i * 3 + 2]);
    const t2 = new Vec3(tan2[i * 3], tan2[i * 3 + 1], tan2[i * 3 + 2]); // Gram-Schmidt orthogonalize

    const ndott = n.dot(t1);
    temp.set(n.x, n.y, n.z);
    temp.scale(new Vec3(ndott, ndott, ndott));
    temp.subtract(t1, temp).normalize();
    tangent.x = temp.x;
    tangent.y = temp.y;
    tangent.z = temp.z; // Calculate handedness

    temp.cross2(n, t1);
    tangent.w = temp.dot(t2) < 0.0 ? -1.0 : 1.0;
    tangents.push(tangent.clone());
  }

  return tangents;
}
/**
 * @param u
 * @param v
 * @param w
 * @param udir
 * @param vdir
 * @param width
 * @param height
 * @param depth
 * @param gridX
 * @param gridY
 */


function buildPlane$1(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const oneOverGridX = 1.0 / gridX;
  const oneOverGridY = 1.0 / gridY;
  const segmentWidth = width * oneOverGridX;
  const segmentHeight = height * oneOverGridY;
  const widthHalf = width * 0.5;
  const heightHalf = height * 0.5;
  const depthHalf = depth * 0.5;
  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;
  const vector = new Vec3(); // generate vertices, normals and uvs

  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segmentHeight - heightHalf;

    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segmentWidth - widthHalf; // set values to correct vector component

      vector[u] = x * udir;
      vector[v] = y * vdir;
      vector[w] = depthHalf; // set positions

      positions.push(vector.clone()); // set values to correct vector component

      vector[u] = 0;
      vector[v] = 0;
      vector[w] = depth > 0 ? 1 : -1; // set normals

      normals.push(vector.clone()); // set uvs

      uvs.push(new Vec2(ix * oneOverGridX, 1.0 - iy * oneOverGridY));
    }
  } // indices
  // 1. you need three indices to draw a single face
  // 2. a single segment consists of two faces
  // 3. so we need to generate six (2*3) indices per segment


  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = ix + 1 + gridX1 * (iy + 1);
      const d = ix + 1 + gridX1 * iy; // face 1

      indices.push(a, b, d); // face 2

      indices.push(b, c, d);
    }
  }

  const tangents = calculateTangents(positions, normals, uvs, indices);
  return {
    positions: positions,
    normals: normals,
    uvs: uvs,
    tangents: tangents,
    indices: indices
  };
}
/**
 * @param options
 */


function box(options) {
  const width = options && options.width !== undefined ? options.width : 1.0;
  const height = options && options.height !== undefined ? options.height : 1.0;
  const depth = options && options.depth !== undefined ? options.depth : 1.0;
  let widthSegments = options && options.widthSegments !== undefined ? options.widthSegments : 1.0;
  let heightSegments = options && options.heightSegments !== undefined ? options.heightSegments : 1.0;
  let depthSegments = options && options.depthSegments !== undefined ? options.depthSegments : 1.0;
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const halfDepth = depth * 0.5; // segments

  widthSegments = Math.floor(widthSegments) || 1.0;
  heightSegments = Math.floor(heightSegments) || 1.0;
  depthSegments = Math.floor(depthSegments) || 1.0; // build each side of the box geometry

  const rightFace = buildPlane$1('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments);
  const leftFace = buildPlane$1('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments);
  const topFace = buildPlane$1('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments);
  const bottomFace = buildPlane$1('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments);
  const frontFace = buildPlane$1('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments);
  const backFace = buildPlane$1('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments);
  const aabb = new Amaz.AABB();
  aabb.min_x = -halfWidth;
  aabb.min_y = -halfHeight;
  aabb.min_z = -halfDepth;
  aabb.max_x = halfWidth;
  aabb.max_y = halfHeight;
  aabb.max_z = halfDepth;
  return {
    data: [rightFace, leftFace, topFace, bottomFace, frontFace, backFace],
    aabb
  };
}

var geometry = {
  __proto__: null,
  box: box
};

/**
 * @class
 * @category Utils
 * @name State
 * @classdesc Plain old-school state matching to entity/component behavior.
 * @description Constructor to create State object.
 * @param {string} name - Unique identifier for state.
 * @param {object} context - Any info you'd like to use in behavior under that state.
 * @example
 * // create the state
 * const state = new amg.State('Stand', scene)
 */
class State {
  constructor(name, context) {
    this._name = name;
    this._context = context;
  }
  /**
   * @function
   * @name State#equals
   * @returns {boolean} equals of two states.
   * @description Check if two states are equal by comparing their name/uid.
   * @param {State} state - the state to compare.
   */


  equals(state) {
    return this._name === state.name;
  }
  /**
   * @name State#name
   * @type {string}
   * @description The uid or name of state. [read only]
   */


  get name() {
    return this._name;
  }
  /**
   * @name State#context
   * @type {object}
   * @description The context needed for state to work. [read only]
   */


  get context() {
    return this._context;
  }
  /**
   * @function
   * @name State#onEnter
   * @description The job when entering this state.
   */


  onEnter() {//Do nothing
  }
  /**
   * @function
   * @name State#onExit
   * @description The job when entering this state.
   */


  onExit() {//Do nothing
  }
  /**
   * @function
   * @name State#onUpdate
   * @description The job when updating under this state.
   * @param {number} _deltaTime - The deltaTime between updates.
   */

  /* eslint-disable @typescript-eslint/no-empty-function */


  onUpdate(_deltaTime) {}
  /**
   * @function
   * @name State#onEvent
   * @description Handle event under this state.
   * @param {Amaz.Event} _event - The Amaz.Event from engine.
   */


  onEvent(_event) {}
  /* eslint-enable @typescript-eslint/no-empty-function */

  /**
   * @function
   * @name State#toString
   * @returns {string} This state's name.
   * @description Print State into string e.g. "[name]".
   */


  toString() {
    return `[${this._name}]`;
  }

}
/**
 * @class
 * @category Utils
 * @name StateMachine
 * @classdesc StateMachine that simply keep registration of all states.
 * @description Constructor to create an StateMachine instance.
 * @example
 * // create the statemachine instance
 * const stateMachine = new amg.StateMachine();
 *
 * // register your state
 * stateMachine.registerState(myState);
 */

class StateMachine {
  constructor() {
    this._registeredStates = new Map();
  }
  /* eslint-disable @typescript-eslint/no-empty-function */

  /**
   * @function
   * @name StateMachine#setState
   * @description Set the state as current in statemachine.
   * @param {string} _name - name/uid of the state.
   */


  setState(_name) {}
  /**
   * @function
   * @name StateMachine#removeState
   * @description Remove the state from current in statemachine.
   * @param {string} _name - name/uid of the state.
   */


  removeState(_name) {}
  /**
   * @function
   * @name StateMachine#onUpdate
   * @description State machine update.
   * @param {number} _deltaTime - The deltaTime between updates.
   */


  onUpdate(_deltaTime) {}
  /**
   * @function
   * @name StateMachine#onEvent
   * @description Handle event.
   * @param {Amaz.Event} _event - The Amaz.Event from engine.
   */


  onEvent(_event) {}
  /* eslint-enable @typescript-eslint/no-empty-function */

  /**
   * @function
   * @name StateMachine#registerState
   * @description Register the state so that you can later use it with name/uid.
   * @param {State} state - State object.
   */


  registerState(state) {
    if (this._registeredStates.has(state.name)) {
      console.log(`State [${state.name}] already registered! Overriding`);
    }

    this._registeredStates.set(state.name, state);
  }

}
/**
 * @class
 * @category Utils
 * @name MultiToggleStateMachine
 * @augments StateMachine
 * @classdesc Multiple binary state or toggle mode machine. You can set multiple binary
 * state/toggle in it.
 * @description Constructor to create an MultiToggleStateMachine instance.
 * @example
 * // create the MultiToggleStateMachine instance
 * const mtsm = new amg.MultiToggleStateMachine();
 *
 * // register your state
 * mtsm.registerState(myState);
 *
 */


class MultiToggleStateMachine extends StateMachine {
  constructor() {
    super(...arguments);
    this._currentStates = new Set();
  }
  /**
   * @function
   * @name MultiToggleStateMachine#onUpdate
   * @description State machine update.
   * @param {number} deltaTime - The deltaTime between updates.
   */


  onUpdate(deltaTime) {
    for (const stateName of this._currentStates) {
      const s = this._registeredStates.get(stateName);

      if (s) {
        s.onUpdate(deltaTime);
      }
    }
  }
  /**
   * @function
   * @name MultiToggleStateMachine#onEvent
   * @description Handle event.
   * @param {Amaz.Event} event - The Amaz.Event from engine.
   */


  onEvent(event) {
    for (const stateName of this._currentStates) {
      const s = this._registeredStates.get(stateName);

      if (s) {
        s.onEvent(event);
      }
    }
  }
  /**
   * @function
   * @name MultiToggleStateMachine#setState
   * @description Set the state as current in statemachine. Allows multiple states at the same time.
   * @param {string} name - name/uid of the state.
   */


  setState(name) {
    if (!this._registeredStates.has(name)) {
      console.log(`Unrecognized state [${name}]`);
      return;
    }

    const s = this._registeredStates.get(name);

    if (!this._currentStates.has(name)) {
      if (s) s.onEnter();

      this._currentStates.add(name);
    }
  }
  /**
   * @function
   * @name MultiToggleStateMachine#removeState
   * @description Remove the state from current in statemachine.
   * @param {string} name - name/uid of the state.
   */


  removeState(name) {
    if (!this._registeredStates.has(name)) {
      console.log(`Unrecognized state [${name}]`);
    }

    if (this._currentStates.has(name)) {
      const s = this._registeredStates.get(name);

      if (s) s.onExit();

      this._currentStates.delete(name);
    }
  }

}
/**
 * @class
 * @category Utils
 * @name FiniteStateMachine
 * @augments StateMachine
 * @classdesc Old school finite state machine that only allows one state and
 * keep transitions (edges of state graph).
 * @description Constructor to create an FiniteStateMachine instance.
 * @example
 * // create the FSM instance
 * const fsm = new amg.FiniteStateMachine();
 *
 * // register your state
 * mtsm.registerState(myState);
 *
 */

class FiniteStateMachine extends StateMachine {
  constructor() {
    super(...arguments);
    this._currentState = null;
    this._transitions = new Map();
  }
  /**
   * @function
   * @name FiniteStateMachine#addTransition
   * @description Add transition link from one state to another.
   * @param {number} from - The previous state.
   * @param {number} to - The next state.
   */


  addTransition(from, to) {
    if (!this._registeredStates.has(from) || !this._registeredStates.has(to)) {
      return;
    }

    if (!this._transitions.has(from)) {
      this._transitions.set(from, new Set());
    }

    const fromSet = this._transitions.get(from);

    if (fromSet) {
      fromSet.add(to);
    }
  }
  /**
   * @function
   * @name FiniteStateMachine#isValidTransition
   * @description Check if transition link from one state to another is valid.
   * @param {number} from - The previous state.
   * @param {number} to - The next state.
   * @returns {boolean} Return if transition is valid.
   */


  isValidTransition(from, to) {
    const fromSet = this._transitions.get(from);

    if (fromSet) {
      return fromSet.has(to);
    }

    return false;
  }
  /**
   * @function
   * @name FiniteStateMachine#setState
   * @description Setting the state means switching the state, and only do it when
   * transition exists.
   * @param {string} name - name/uid of the state.
   */


  setState(name) {
    if (!this._registeredStates.has(name)) {
      return;
    } // transition?


    if (this._currentState && this.isValidTransition(this._currentState.name, name)) {
      const oldState = this._currentState;
      oldState.onExit();
    }

    const newState = this._registeredStates.get(name);

    if (newState) {
      newState.onEnter();
    }

    this._currentState = newState;
  }
  /**
   * @function
   * @name FiniteStateMachine#removeState
   * @description Remove the state or back to dummy state. Not for FSM.
   * @param {string} name - name/uid of the state.
   */


  removeState(name) {
    if (!this._currentState) {
      return;
    }

    if (this._currentState.name !== name) {
      return;
    }

    this._currentState.onExit();

    this._currentState = null;
  }
  /**
   * @function
   * @name FiniteStateMachine#onUpdate
   * @description State machine update.
   * @param {number} deltaTime - The deltaTime between updates.
   */


  onUpdate(deltaTime) {
    if (!this._currentState) {
      return;
    }

    this._currentState.onUpdate(deltaTime);
  }
  /**
   * @function
   * @name FiniteStateMachine#onEvent
   * @description Handle event.
   * @param {Amaz.Event} event - The Amaz.Event from engine.
   */


  onEvent(event) {
    if (!this._currentState) {
      return;
    }

    this._currentState.onEvent(event);
  }

}

exports.AABB = AABB;
exports.AvatarDrive = AvatarDrive;
exports.Body2D = Body2D;
exports.Body3D = Body3D;
exports.Color = Color;
exports.Engine = Engine;
exports.Entity = Entity;
exports.EntityLayerMax = EntityLayerMax;
exports.EntityTagMax = EntityTagMax;
exports.EventHandler = EventHandler;
exports.FiniteStateMachine = FiniteStateMachine;
exports.Geometry = geometry;
exports.Gyroscope = Gyroscope;
exports.Hand = Hand;
exports.Head = Head;
exports.Mat3 = Mat3;
exports.Mat4 = Mat4;
exports.Material = Material;
exports.Mesh = Mesh;
exports.MultiToggleStateMachine = MultiToggleStateMachine;
exports.Quat = Quat;
exports.Rect = Rect;
exports.Scene = Scene;
exports.Script = Script;
exports.Segmentation = Segmentation;
exports.State = State;
exports.TouchDevice = TouchDevice;
exports.Vec2 = Vec2;
exports.Vec3 = Vec3;
exports.Vec4 = Vec4;
exports.XShader = XShader;
//# sourceMappingURL=amg.cjs.development.js.map
