// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseComponent from "../Base/BaseComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends BaseComponent {

    @property(cc.Prefab)
    graphics: cc.Prefab = null;
    @property(cc.PhysicsBoxCollider)
    leftBian: cc.PhysicsBoxCollider = null;
    @property(cc.PhysicsBoxCollider)
    rightBian: cc.PhysicsBoxCollider = null;
    @property(cc.PhysicsBoxCollider)
    downBian: cc.PhysicsBoxCollider = null;
    @property(cc.Node)
    ball: cc.Node = null;

    private graphicLayer:cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //关闭多点触碰，否则手指画线时容易画到乱七八糟
        cc.macro.ENABLE_MULTI_TOUCH = false;
        //开启物理引擎
        let manager = cc.director.getPhysicsManager();
        manager.enabled = true;

        manager.debugDrawFlags =
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit;

        // //绘制物理信息
        // manager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_jointBit |
        // cc.PhysicsManager.DrawBits.e_shapeBit;

        //事件注册
        this.onEvent("graphics_control_touch_end",this.graphic_control_touch_end,this);

        this.graphicLayer = cc.find("Canvas/GraphicLayer");
        this.ball.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;

    }

    start () {

        this.downBian.node.position = cc.v3(0, -cc.winSize.height / 2,0);
        //this.downBian.editing = true;
        this.downBian.size = cc.size(cc.winSize.width,10);

        this.leftBian.node.position = cc.v3(-cc.winSize.width / 2 + this.leftBian.size.width, 0);

        this.rightBian.node.position = cc.v3(cc.winSize.width / 2 - this.rightBian.size.width, 0);

         //先准备好一个绘制界面
         this.createGraphics();

    }

    // update (dt) {}

    //-----------------------------------private Func---------------------
    private graphic_control_touch_end(event:cc.Touch){
        this.createGraphics();
        this.ball.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
    }

    //--------------------------------public Func--------------------------
    public createGraphics(){
        var graphics_node = cc.instantiate(this.graphics);
        graphics_node.x = 0;
        this.graphicLayer.addChild(graphics_node);
    }
}
