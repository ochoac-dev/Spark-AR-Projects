--
-- Created by IntelliJ IDEA.
-- User: xuyuan
-- Date: 2020/12/24
-- Time: 8:26
-- To change this template use File | Settings | File Templates.
--

local CGVertexsToRect = CGVertexsToRect or {}
CGVertexsToRect.__index = CGVertexsToRect

function CGVertexsToRect.new()
    local self = setmetatable({}, CGVertexsToRect)
    self.inputs = {}
    self.outputs = {}
    self.nexts = {}
    return self
end

function CGVertexsToRect:setNext(index, func)
    self.nexts[index] = func
end

function CGVertexsToRect:setInput(index, func)
    self.inputs[index] = func
end

function CGVertexsToRect:getOutput(index)
    local topLeft = self.inputs[0]()
    if topLeft == nil then
        return nil
    end
    local bottomLeft = self.inputs[1]()
    if bottomLeft == nil then
        return nil
    end
    local topRight = self.inputs[2]()
    if topRight == nil then
        return nil
    end
    local bottomRight = self.inputs[3]()
    if bottomRight == nil then
        return nil
    end
    return Amaz.Rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
end

return CGVertexsToRect
