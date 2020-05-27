// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import MyphysicsCollider from "./MyphysicsCollider";

@ccclass
export default class GraphicsControl extends cc.Component {

    //@property(cc.Graphics)
    graphics: cc.Graphics = null;

   // @property([cc.Vec2])
    line_point: any = [];

    private rigibodyLogic:cc.RigidBody = null;

    private physicsLine:MyphysicsCollider;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        this.node.position = cc.v3(0,0);
    }

    start () {
        
        this.graphics = this.getComponent(cc.Graphics);
        this.onTouch();
    }

    // update (dt) {}

    //-----------------------------------private Func------------------------------------------------
    private onTouch(){
        this.node.on(cc.Node.EventType.TOUCH_START, this.touch_start, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touch_end, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touch_end, this);
    }

    private offTouch(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.touch_start, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touch_end, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touch_end, this);
    }

    /**
     * 创建刚体
     */
    private createRigibody(){
        //添加物理刚体
        this.rigibodyLogic = this.addComponent(cc.RigidBody);
        this.rigibodyLogic.gravityScale = 2;
        //添加自定义多边形碰撞
        this.physicsLine = this.addComponent("MyPhysicsCollider");
        this.physicsLine.lineWidth = 10;
        this.physicsLine.points = this.line_point;
        this.physicsLine.friction = 0.2;
        this.physicsLine.density = 1;
        this.physicsLine.apply();
    }

    //防止出现手指过粗绘制出了实体多边形
    public checkIsCanDraw(lastPoint:cc.Vec2,nowPoint:cc.Vec2):Boolean{
        return lastPoint.sub(nowPoint).mag() >= 5;
    }

    //---------------------------------public Func-----------------------------------------------------

    //--------------------------------handler---------------------------------------------------------
    private touch_start(event:cc.Touch){
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.graphics.moveTo(pos.x, pos.y);
        this.line_point.push(cc.v2(pos.x, pos.y));
    }

    private touch_move(event:cc.Touch){
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        let prePos = this.node.convertToNodeSpaceAR(event.getPreviousLocation());
        if(!this.checkIsCanDraw(prePos,pos)){
            return;
        }
        this.graphics.lineTo(pos.x, pos.y);
        this.line_point.push(cc.v2(pos.x, pos.y));
        this.graphics.stroke();
    }

    private touch_end(event:cc.Touch){
        this.createRigibody();
        this.offTouch();
    }
    
}
