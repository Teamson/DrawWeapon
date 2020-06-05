import AdMgr from "../Mod/AdMgr"
import PrefabManager, { PrefabItem } from "../Libs/PrefabManager"
import WxApi from "../Libs/WxApi"
import JJMgr from "../JJExport/Common/JJMgr"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Utility from "../Mod/Utility"

export default class KillBossUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    barNode: Laya.ProgressBar = this['barNode']
    clickBtn: Laya.Image = this['clickBtn']
    atkAni: Laya.Animation = this['atkAni']

    curProgress: number = 0

    closeCallback: Function = null

    onOpened(param?: any) {
        if (param != null && param != undefined) {
            this.closeCallback = param
        }
        this.atkAni.loop = false

        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)

        this.clickBtn.on(Laya.Event.MOUSE_DOWN, this, this.clickBtnCBDown)
        this.clickBtn.on(Laya.Event.MOUSE_UP, this, this.clickBtnCBUp)

        Utility.visibleDelay(this.closeBtn, 3000)

        Laya.timer.frameLoop(1, this, this.decBar)
    }

    onClosed() {
        Laya.timer.clearAll(this)
        this.closeCallback && this.closeCallback()
    }

    decBar() {
        if (this.curProgress >= 1) {
            Laya.timer.clearAll(this)
            return
        }

        this.curProgress -= 0.005
        if (this.curProgress < 0) {
            this.curProgress = 0
        }

        this.barNode.value = this.curProgress
    }

    clickBtnCBDown() {
        this.atkAni.play(0, false)
        this.clickBtn.scaleX = 1.2
        this.clickBtn.scaleY = 1.2

        this.curProgress += 0.2
        if (this.curProgress > 1) {
            this.curProgress = 1
            this.barNode.value = 1
            return
        }
        let curG = PlayerDataMgr.getPlayerData().grade - 1
        let gGap = (curG - JJMgr.instance.dataConfig.front_box_gate) % (JJMgr.instance.dataConfig.front_box_everygate) == 0 &&
            (curG - JJMgr.instance.dataConfig.front_box_gate) != 0
        if (this.curProgress >= 0.8 && curG >= JJMgr.instance.dataConfig.front_box_gate &&
            gGap) {
            AdMgr.instance.showBanner()
        }

        this.createCoin()
        this.createCoin()
        this.createCoin()
        this.createCoin()
        this.createCoin()
    }
    clickBtnCBUp() {
        this.clickBtn.scaleX = 1
        this.clickBtn.scaleY = 1
    }

    closeBtnCB() {
        this.close()
    }

    createCoin() {
        let coin = PrefabManager.instance().getItem(PrefabItem.Coin) as Laya.Image
        this.addChild(coin)
        coin.pos(375, 520)

        let desPos = new Laya.Vector2(Math.random() * 400 - 200, Math.random() * 400 - 200)
        Laya.Tween.to(coin, { x: desPos.x + 375, y: desPos.y + 520 }, 200);

        Laya.timer.once(2000, this, () => {
            coin.destroy()
        })
    }
}