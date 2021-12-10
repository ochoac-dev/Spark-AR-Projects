--
-- Created by IntelliJ IDEA.
-- User: xuyuan
-- Date: 2021/5/31
-- Time: 6:42
-- To change this template use File | Settings | File Templates.
--

local CGAnimatorController = CGAnimatorController or {}
CGAnimatorController.__index = CGAnimatorController

function CGAnimatorController.new()
    local self = setmetatable({}, CGAnimatorController)
    self.inputs = {}
    self.outputs = {}
    self.nexts = {}
    self.component = nil
    self.animation = {}
    self.clip = {}
    self.loops = 0
    self.curLoop = {}
    self.stayLastFrame = false
    self.duration = {}
    self.curTime = 0
    self.lastLoopTime = {}
    self.playState = nil
    self.size = 0
    self.enable = false
    return self
end

function CGAnimatorController:setNext(index, func)
    self.nexts[index] = func
end

function CGAnimatorController:setInput(index, func)
    self.inputs[index] = func
end

function CGAnimatorController:getOutput(index)
    return self.outputs[index]
end

function CGAnimatorController:update(sys, dt)
    if self.component == nil or self.enable == false then
        return
    end
    if self.playState == "play" then
        self.curTime = self.curTime + dt
        for i = 1, self.size do
            if self.curTime - self.lastLoopTime[i] >= self.duration[i] then
                self.component:schedule(self.clip[i], 1, 1)
                self.curLoop[i] = self.curLoop[i] + 1
                self.lastLoopTime[i] = self.curTime
            end
        end
    elseif self.playState == "stop" then
        self.curTime = 0
        for i = 1, self.size do
            self.lastLoopTime[i] = 0
            self.curLoop[i] = 0
        end
    end
    local cnt = 0
    for i = 1, self.size do
        if self.curLoop[i] >= self.loops then
            cnt = cnt + 1
        end
    end
    if cnt == self.size then
        self.component:stopAllAnimations()
        if self.stayLastFrame == false then
            self.component.entity.visible = false
        end
    end
end

function CGAnimatorController:execute(index)
    if self.inputs[4] == nil then
        return
    end
    self.component = self.inputs[4]()
    if self.inputs[5] == nil then
        return
    end
    local animations = self.component.animations
    self.size = animations:size()
    if self.size < 1 then
        Amaz.LOGE("ERROR: ", "animations size is 0 !!")
        return
    end
    for i = 1, self.size do
        self.animation[i] = animations:get(i-1)
        self.duration[i] = self.animation[i].duration
        self.clip[i] = self.animation[i]:getClip("", self.component)
        if self.clip[i] == nil then
            Amaz.LOGE("ERROR: ", "got a nil clip !!")
            return
        end
    end
    self.loops = self.inputs[5]()
    self.stayLastFrame = self.inputs[6]()
    if self.component.entity.visible == false then
        self.component.entity.visible = true
    end
    if index == 0 then
        self.curTime = 0
        self.lastTime = 0
        self.component:stopAllAnimations()
        for i = 1, self.size do
            self.curLoop[i] = 0
            self.lastLoopTime[i] = 0
            self.component:schedule(self.clip[i], 1, 1)
        end
        self.playState = "play"
        self.enable = true
        if self.nexts[1] then
            self.nexts[1]();
        end
    elseif index == 1 then
        self.component:stopAllAnimations()
        self.playState = "stop"
        self.enable = false
        if self.nexts[2] then
            self.nexts[2]()
        end
    elseif index == 2 then
        self.component:pauseAnimator()
        self.playState = "pause"
        self.enable = false
    elseif index == 3 then
        self.component:resumeAnimator()
        self.playState = "play"
        self.enable = true
    end
    if self.nexts[0] then
        self.nexts[0]()
    end
end

return CGAnimatorController
