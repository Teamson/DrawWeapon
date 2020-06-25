import AdMgr from "../../Mod/AdMgr"
import JJUtils from "../Common/JJUtils"
import JJMgr, { SceneDir } from "../Common/JJMgr"
import Utility from "../../Mod/Utility"
import WxApi from "../../Libs/WxApi"
import PlayerDataMgr from "../../Libs/PlayerDataMgr"
import GameLogic from "../../Crl/GameLogic"

export default class ProgramUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    navList: Laya.List = this['navList']

    navData: any[] = []
    scrollDir: number = 1
    preIndex: number = -1
    closeCallbackFun: Function = null

    starArr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    onOpened(param?: any) {
        if (param && param.closeCallbackFun) {
            this.closeCallbackFun = param.closeCallbackFun
        }
        this._init()
        AdMgr.instance.hideBanner()
        Laya.timer.frameLoop(1, this, () => {
            AdMgr.instance.hideBanner(false)
        })

        this.starArr = Utility.shuffleArr(this.starArr)
        this.starArr = this.starArr.splice(0, 6)

        this['bounesCoin'].visible = GameLogic.Share.gotKillBossBounes
        if (GameLogic.Share.gotKillBossBounes) {
            GameLogic.Share.gotKillBossBounes = false
            let c = Utility.GetRandom(30, 100)
            this['bounesCoin'].text = '成功领取' + c + '金币'
            Utility.tMove2D(this['bounesCoin'], this['bounesCoin'].x, this['bounesCoin'].y - 100, 2000, () => { this['bounesCoin'].visible = false })
            PlayerDataMgr.changeCoin(c)
        }
    }

    onClosed() {
        Laya.timer.clearAll(this)
        this.closeCallbackFun && this.closeCallbackFun()
    }

    _init() {
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeCB)
        this.initList()
    }

    //初始化list
    initList() {
        this.navData = [].concat(JJMgr.instance.navDataArr)
        this.navList.vScrollBarSkin = '';
        this.navList.repeatX = 1;
        this.navList.repeatY = this.navData.length;
        this.navList.array = this.navData;
        this.navList.height = 1130 * Laya.stage.displayHeight / 1334
        this.navList.renderHandler = Laya.Handler.create(this, this.onListRender, null, false);
        this.navList.mouseHandler = new Laya.Handler(this, this.mouseHandler);

        Laya.timer.once(1000, this, () => {
            Laya.timer.frameLoop(1, this, this.scrollLoop)
        })
    }
    mouseHandler(e, index) {
        this.againScroll()
    }
    againScroll() {
        Laya.timer.clear(this, this.scrollLoop)
        Laya.timer.once(1000, this, () => {
            Laya.timer.frameLoop(1, this, this.scrollLoop)
        })
    }
    scrollLoop() {
        let scrollBar: Laya.ScrollBar = this.navList.scrollBar
        scrollBar.value += this.scrollDir
        if (scrollBar.value >= scrollBar.max || scrollBar.value <= 0) {
            this.scrollDir = -this.scrollDir
            this.againScroll()
        }
    }
    onListRender(cell, index) {
        if (index >= this.navList.array.length) {
            return;
        }
        var item = cell.getChildByName('item')
        var icon = item.getChildByName('icon')
        var name = item.getChildByName('name')
        var star = item.getChildByName('star')

        star.visible = index < 10 && this.starArr.indexOf(index) != -1
        icon.skin = this.navData[index].icon
        name.text = JJMgr.instance.getTitle(index)
        item.off(Laya.Event.CLICK, this, this.navCB, [index])
        item.on(Laya.Event.CLICK, this, this.navCB, [index])
    }
    navCB(index: number) {
        console.log('click id:', index)
        JJMgr.instance.NavigateApp(index, null, null, SceneDir.SCENE_PROGRAMUI)
    }

    closeCB() {
        this.close()
    }
}