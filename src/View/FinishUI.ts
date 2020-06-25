import PlayerDataMgr from "../Libs/PlayerDataMgr"
import GameLogic from "../Crl/GameLogic"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import JJMgr, { SceneDir } from "../JJExport/Common/JJMgr"
import AdMgr from "../Mod/AdMgr"

export default class FinishUI extends Laya.Scene {
    constructor() {
        super()
    }

    openBoxBtn: Laya.Image = this['openBoxBtn']
    videoBtn: Laya.Image = this['videoBtn']
    noBtn: Laya.Image = this['noBtn']
    bounes: Laya.Image = this['bounes']

    boxBtnEnabled: boolean = true

    onOpened(param?: any) {

        AdMgr.instance.hideBanner()
        WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：通关')
        this.initData()

        JJMgr.instance.openScene(SceneDir.SCENE_FINISHGAMEUI, false, { posY: 600, fixY: true })

        JJMgr.instance.closeScene(SceneDir.SCENE_DRAWUI)
    }

    onClosed() {
        AdMgr.instance.hideBanner()
    }

    initData() {
        this.openBoxBtn.on(Laya.Event.CLICK, this, this.openBoxCB)
        this.videoBtn.on(Laya.Event.CLICK, this, this.videoBtnCB)
        this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB)

        let grade = PlayerDataMgr.getPlayerData().grade - 1
        let g = Math.floor(grade % 4) == 0 ? 4 : Math.floor(grade % 4)
        this.bounes.skin = g == 4 ? 'finishUI/js-bx.png' : 'finishUI/js-ys.png'
        this.openBoxBtn.visible = g == 4
        this.videoBtn.visible = g != 4
        this.noBtn.visible = g != 4

        if (this.noBtn.visible)
            WxApi.fixBtnTouchPos(this.noBtn, 300, 100, this)
        else {
            this.boxBtnEnabled = false
            WxApi.fixBtnTouchPos(this.openBoxBtn, 300, 0, this, () => { this.boxBtnEnabled = true })
        }

        GameLogic.Share.isHelpStart = false
        GameLogic.Share.gradeIndex = 0
        PlayerDataMgr.getPlayerData().gradeIndex = 0
        PlayerDataMgr.setPlayerData()
    }

    openBoxCB() {
        if (!this.boxBtnEnabled) return
        Laya.Scene.open('MyScenes/BoxUI.scene')
    }

    videoBtnCB() {
        WxApi.aldEvent('视频/分享打开宝箱：点击')
        let cb: Function = () => {
            WxApi.aldEvent('视频/分享打开宝箱：成功')
            Laya.Scene.open('MyScenes/BoxUI.scene')
        }
        ShareMgr.instance.shareGame(cb)
    }

    noBtnCB() {
        this.close()
        JJMgr.instance.closeScene(SceneDir.SCENE_FINISHGAMEUI)
        JJMgr.instance.openScene(SceneDir.SCENE_FULLGAMEUI, false, {
            grade: PlayerDataMgr.getPlayerData().grade,
            continueCallbackFun: () => {
                Laya.Scene.open('MyScenes/GameUI.scene', false, () => {
                    GameLogic.Share.restartGame()
                    JJMgr.instance.openScene(SceneDir.SCENE_NEWGAMEUI, false)
                })
            }
        })
    }
}