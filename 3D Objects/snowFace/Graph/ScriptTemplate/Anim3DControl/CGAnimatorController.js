/**
 * @file CGAnimatorController.js
 * @author xuyuan
 * @date 2021/10/14
 * @brief CGAnimatorController.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const Amaz = effect.Amaz;
const {BaseNode} = require("./BaseNode");

class CGAnimatorController extends BaseNode {
    constructor() {
        super();
        this.component = null;
        this.animationList = new Array();
        this.animationSize = 0;
        this.currentClip = null;
        this.loops = 0;
        this.currentLoop = 0;
        this.infinity = false;
        this.errorConfig = false;
        this.stayLastFrame = false;
        this.finish = false;
        this.sys = null;
        this.state = '';
    }

    beforeStart(sys) {
        this.sys = sys;
        this.component = this.inputs[4]();
        if (!this.component || false === this.component.isInstanceOf("Animator")) {
            this.errorConfig = true;
            return;
        }
        this.loops = this.inputs[6]();
        if (this.loops === 0) {
            console.error("animation loops 0 times !!");
            this.errorConfig = true;
            return;
        }
        if (this.loops === -1) {
            this.infinity = true;
        }
        this.stayLastFrame = this.inputs[7]();
        this.animationList = this.component.animations;
        this.animationSize = this.animationList.size();
        if (this.animationSize < 1) {
            console.error("animations size is 0 !!");
            this.errorConfig = true;
            return;
        }
        let chooseIndex = this.inputs[5]();
        if (chooseIndex >= this.animationSize || chooseIndex < 0 ) {
            console.error("animation chooseIndex error !!");
            this.errorConfig = true;
            return;
        }
        let chooseAnim = this.animationList.get(chooseIndex);
        if (!chooseAnim ) {
            console.error("get chosen animation error !!");
            this.errorConfig = true;
            return;
        }
        this.currentClip = chooseAnim.getClip("", this.component);
        if (!this.currentClip) {
            console.error("get clip from animation error !!");
            this.errorConfig = true;
            return;
        }
        sys.script.removeScriptListener(this.currentClip, Amaz.AnimazEventType.ANIM_END, "onCallBack", sys.script);
        sys.script.addScriptListener(this.currentClip, Amaz.AnimazEventType.ANIM_END, "onCallBack", sys.script);
    }

    execute(index) {
        if (this.nexts[0]) {
            this.nexts[0]();
        }
        if (this.errorConfig) {
            return;
        }
        if (this.finish === true && index !== 0) {
            return;
        }
        if (this.component.entity.visible === false) {
            this.component.entity.visible = true
        }
        if (index === 0) {
            this.finish = false;
            this.currentLoop = 0;
            if (this.sys) {
                this.beforeStart(this.sys);
            }
            this.state = 'play';
            this.component.resumeAnimator();
            this.component.stopAllAnimations();
            let clipPlaySpeed = this.currentClip.getSpeed();
            this.component.schedule(this.currentClip, 1, clipPlaySpeed);
            if (this.nexts[1]) {
                this.nexts[1]();
            }
        } else if (index === 1) {
            this.component.stopAllAnimations();
            this.state = 'stop';
            if (this.nexts[2]) {
                this.nexts[2]();
            }
        } else if (index === 2) {
            this.state = 'pause';
            this.component.pauseAnimator();
        } else if (index === 3) {
            this.state = 'resume';
            this.component.resumeAnimator();
        }
    }

    onCallBack(sys, clip, eventType) {
        if (eventType === Amaz.AnimazEventType.ANIM_END) {
            if (clip.equals(this.currentClip) && this.state !== 'stop') {
                this.currentLoop = this.currentLoop + 1;
                if (this.currentLoop >= this.loops && false === this.infinity) {
                    if (this.stayLastFrame) {
                        this.component.pauseAnimator();
                    } else {
                        this.component.stopAllAnimations();
                        this.component.entity.visible = false;
                    }
                    if (this.nexts[3]) {
                        this.nexts[3]();
                    }
                    this.finish = true;
                } else {
                    let clipPlaySpeed = this.currentClip.getSpeed();
                    this.component.schedule(this.currentClip, 1, clipPlaySpeed);
                }
            }
        }
    }

    onDestroy(sys) {
        sys.script.removeScriptListener(this.currentClip, Amaz.AnimazEventType.ANIM_END, "onCallBack", sys.script);
    }
};

exports.CGAnimatorController = CGAnimatorController;
