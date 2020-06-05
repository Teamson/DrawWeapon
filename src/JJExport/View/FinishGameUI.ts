import JJMgr, { SceneDir } from "../Common/JJMgr"
import JJUtils from "../Common/JJUtils"
import AdMgr from "../../Mod/AdMgr"
import Utility from "../../Mod/Utility"
import PlayerDataMgr from "../../Libs/PlayerDataMgr"

export default class FinishGameUI extends Laya.Scene {
    constructor() {
        super()
    }

    navList: Laya.List = this['navList']

    navData: any[] = []

    from: string = null

    totalArr: any[] = []
    curIndex: number = 6

    fingerVecArr: Laya.Vector2[] = [
        new Laya.Vector2(185, -38), new Laya.Vector2(446, -38), new Laya.Vector2(693, -38),
        new Laya.Vector2(185, 205), new Laya.Vector2(446, 205), new Laya.Vector2(693, 205)]

    onOpened(param?: any) {
        if (param) {
            if (param.posY) {
                this.navList.y = param.posY
            }
            if (param.fixY == true) {
                JJUtils.fixNodeY(this.navList)

                let rp = Utility.getRandomItemInArr(this.fingerVecArr)
                this['finger'].x = rp.x
                this['finger'].y = this.navList.y + rp.y

            }
            if (param.from) {
                this.from = param.from
            }
        }


        // if (PlayerDataMgr.getPlayerData().grade >= JJMgr.instance.dataConfig.front_auto_history_level)
        //     JJMgr.instance.openScene(SceneDir.SCENE_PROGRAMUI, false)
        this._init()
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    _init() {
        this.navData = []
        this.totalArr = [].concat(JJMgr.instance.navDataArr)
        this.navData = this.totalArr.slice(0, 6)
        this.initList()
    }

    //初始化list
    initList() {
        this.navList.vScrollBarSkin = '';
        this.navList.repeatX = 3;
        this.navList.repeatY = 2;
        this.navList.array = this.navData;
        this.navList.renderHandler = Laya.Handler.create(this, this.onListRender, null, false);
    }
    onListRender(cell, index) {
        if (index >= this.navList.array.length) {
            return;
        }
        var item = cell.getChildByName('item')
        var icon = item.getChildByName('icon')

        icon.skin = this.navData[index].icon
        item.off(Laya.Event.CLICK, this, this.navCB, [this.totalArr.indexOf(this.navData[index]), index])
        item.on(Laya.Event.CLICK, this, this.navCB, [this.totalArr.indexOf(this.navData[index]), index])
    }
    navCB(index: number, listIndex: number) {
        console.log('click id:', index)
        if (this.from == 'key') {
            Laya.Browser.window.wx.aldSendEvent('游戏成功导出页-总点击数')
        } else if (this.from == 'box') {
            Laya.Browser.window.wx.aldSendEvent('开启宝箱导出页-总点击数')
        } else if (this.from == 'fail') {
            Laya.Browser.window.wx.aldSendEvent('游戏失败导出页-总点击数')
        }
        JJMgr.instance.NavigateApp(index, () => { JJMgr.instance.openScene(SceneDir.SCENE_FULLGAMEUI, false, { continueCallbackFun: () => { AdMgr.instance.showBanner() } }) }, () => {
            if (this.from == 'key') {
                Laya.Browser.window.wx.aldSendEvent('游戏成功导出页-总成功跳转数')
            } else if (this.from == 'box') {
                Laya.Browser.window.wx.aldSendEvent('开启宝箱导出页-总成功跳转数')
            } else if (this.from == 'fail') {
                Laya.Browser.window.wx.aldSendEvent('游戏失败导出页-总成功跳转数')
            }
        }, SceneDir.SCENE_FINISHGAMEUI)

        this.navData[listIndex] = this.totalArr[this.curIndex]
        this.curIndex++
        if (this.curIndex >= this.totalArr.length) {
            this.curIndex = 0
        }
        this.initList()
    }
}