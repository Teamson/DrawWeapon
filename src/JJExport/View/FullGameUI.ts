import JJMgr, { SceneDir } from "../Common/JJMgr"
import JJUtils from "../Common/JJUtils"
import AdMgr from "../../Mod/AdMgr"
import WxApi from "../../Libs/WxApi"

export default class FullGameUI extends Laya.Scene {
    constructor() {
        super()
    }

    exitBtn: Laya.Image = this['exitBtn']
    continueBtn: Laya.Image = this['continueBtn']
    navList: Laya.List = this['navList']
    randBtn: Laya.Image = this['randBtn']

    navData: any[] = []
    scrollDir: number = 1
    preIndex: number = -1

    hotArr: number[] = []

    continueCallbackFun: Function = null

    curGrade: number = -1

    onOpened(param?: any) {
        if (param && param.continueCallbackFun) {
            this.continueCallbackFun = param.continueCallbackFun
        }
        if (param && param.grade) {
            this.curGrade = param.grade
        }
        this._init()
        AdMgr.instance.hideBanner()
        Laya.timer.frameLoop(1, this, () => {
            AdMgr.instance.hideBanner(false)
        })
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    _init() {
        this.exitBtn.on(Laya.Event.CLICK, this, this.closeCB)
        this.continueBtn.on(Laya.Event.CLICK, this, this.continueCB)
        this.randBtn.on(Laya.Event.CLICK, this, this.randBtnCB)
        this.randBtn.visible = JJMgr.instance.dataConfig.front_swtich_randompaly
        this.exitBtn.visible = JJMgr.instance.dataConfig.front_swtich_return
        if (this.randBtn.visible)
            WxApi.aldEvent('随机玩一个按钮-弹出次数')
        JJUtils.fixNodeY(this.continueBtn)
        JJUtils.visibleDelay(this.continueBtn, JJMgr.instance.dataConfig.front_export_delay)
        this.getHotRandArr()
        this.initList()

        //this.navCB(Math.floor(Math.random() * this.navData.length), false, true)
        JJMgr.instance.NavigateApp(Math.floor(Math.random() * this.navData.length), null, null, SceneDir.SCENE_FULLGAMEUI)
    }

    getHotRandArr() {
        let arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        arr = JJUtils.shuffleArr(arr)
        this.hotArr = arr.slice(0, 3)
    }

    //初始化list
    initList() {
        this.navData = [].concat(JJMgr.instance.navDataArr)
        //this.navData = JJUtils.shuffleArr(this.navData)
        this.navList.vScrollBarSkin = '';
        this.navList.repeatX = 3;
        this.navList.repeatY = Math.floor(this.navData.length / 3);
        this.navList.array = this.navData;
        this.navList.height = 1050 * Laya.stage.displayHeight / 1334
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
        var hot = item.getChildByName('hot')
        var color = item.getChildByName('color')

        color.skin = 'JJExportRes/' + (Math.floor(index % 9) + 1) + '.png'
        icon.skin = this.navData[index].icon
        name.text = JJMgr.instance.getTitle(index)
        hot.visible = this.hotArr.indexOf(index) != -1
        item.off(Laya.Event.CLICK, this, this.navCB, [index])
        item.on(Laya.Event.CLICK, this, this.navCB, [index])
    }
    navCB(index: number, fromRand?: boolean, autoNav?: boolean) {
        console.log('click id:', index)
        JJMgr.instance.NavigateApp(index, () => {
            JJMgr.instance.openScene(SceneDir.SCENE_PROGRAMUI)
        }, () => {
            if (fromRand)
                WxApi.aldEvent('随机玩一个按钮-总成功跳转数')
        }, SceneDir.SCENE_FULLGAMEUI)
    }

    closeCB() {
        this.close()
        JJMgr.instance.openScene(SceneDir.SCENE_RECOMMENDUI, false, {
            closeCallbackFun: () => {
                JJMgr.instance.openScene(SceneDir.SCENE_FULLGAMEUI, false, { continueCallbackFun: this.continueCallbackFun })
            }
        })
    }

    continueCB() {
        this.close()
        if (this.curGrade != -1 && this.curGrade - 1 >= JJMgr.instance.dataConfig.front_auto_remen_level) {
            JJMgr.instance.openScene(SceneDir.SCENE_RECOMMENDUI, false, {
                closeCallbackFun: () => {
                    this.continueCallbackFun && this.continueCallbackFun()
                }
            })
        } else {
            this.continueCallbackFun && this.continueCallbackFun()
        }
    }

    randBtnCB() {
        WxApi.aldEvent('随机玩一个按钮-总点击数')
        let id = Math.floor(Math.random() * 6)
        if (id >= this.navData.length) id = this.navData.length - 1
        this.navCB(id, true)
    }
}