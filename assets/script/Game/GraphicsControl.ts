// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import MyphysicsCollider from "./MyphysicsCollider";
import BaseComponent from "../Base/BaseComponent";

@ccclass
export default class GraphicsControl extends BaseComponent {

    //@property(cc.Graphics)
    graphics: cc.Graphics = null;

    //移动多少个点进行一次检测
    @property
    check_point_num:number = 10;

   // @property([cc.Vec2])
    line_point: any = [];

    private rigibodyLogic:cc.RigidBody = null;

    private physicsLine:MyphysicsCollider;

    private items:cc.Node = null;

    private curPointIdx:number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        this.node.position = cc.v3(0,0);
        this.curPointIdx = 0;

        this.items = cc.find("Canvas/Item");
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
        //let prePos = this.node.convertToNodeSpaceAR(event.getPreviousLocation());
        let prePos = this.line_point[this.line_point.length - 1];
        let canDraw:boolean = false;
        if(!this.checkIsCanDraw(prePos,pos)){
            return;
        }
        
        //获取item层次中物品，线不与物品相交
        // for(let i = 0;i < this.items.childrenCount;i++){
        //     let child:cc.Node = this.items.children[i];
        //     if(child.getBoundingBoxToWorld().contains(event.getLocation())){
        //         return;
        //     }
        // }
        
        this.line_point.push(cc.v2(pos.x, pos.y));
        for(let i = 0;i < this.items.childrenCount;i++){
            let child:cc.Node = this.items.children[i];
            let rect = cc.rect(child.position.x - child.width/2,child.position.y - child.height/2,child.width,child.height);
            //if(cc.Intersection.rectPolygon(rect,this.line_point)){
            if(cc.Intersection.lineRect(prePos,pos,rect)){
                this.line_point.pop();
                return;
            }
        }
        // this.curPointIdx++;
        // // //创建多边形 模拟是否与物体相交
        // if(this.curPointIdx == this.check_point_num){
        //     canDraw = true;
        //     for(let i = 0;i < this.items.childrenCount;i++){
        //         let child:cc.Node = this.items.children[i];
        //         if(cc.Intersection.rectPolygon(child.getBoundingBox(),this.line_point)){
        //             canDraw = false;
        //         }
        //     }
        //     if(!canDraw){
        //         for(let i = 0; i < this.curPointIdx; i++){
        //             this.line_point.pop();
        //         }
        //         this.curPointIdx = 0;
        //     }
        //     else{
        //         this.graphics.lineTo(pos.x, pos.y);
        //         this.graphics.stroke();
        //         this.curPointIdx = 0;
        //     }
        // }
        this.graphics.lineTo(pos.x, pos.y);
        this.graphics.stroke();
    }

    private touch_end(event:cc.Touch){
        this.createRigibody();
        this.offTouch();
        //通知游戏创建新画布，否则会出现点击第一次看不到画线问题
        this.emitEvent("graphics_control_touch_end");
    }
    
}
