import WxApi from "../Libs/WxApi";
import GameLogic from "../Crl/GameLogic";
import SoundMgr from "../Mod/SoundMgr";

export default class LoadingUI extends Laya.Scene {
    constructor() {
        super()
    }

    perNum: Laya.Label = this['perNum']
    bar: Laya.Label = this['bar']

    onOpened(param?: any) {
        SoundMgr.instance.initLoading(() => {
            if (Laya.Browser.onWeiXin)
                this.loadSubpackage()
            else
                this.loadRes()
        })

        WxApi.aldEvent('加载页面')
    }

    onClosed() {

    }

    loadSubpackage() {
        const loadTask = Laya.Browser.window.wx.loadSubpackage({
            name: 'unity', // name 可以填 name 或者 root
            success: (res) => {
                // 分包加载成功后通过 success 回调
                this.loadRes()
            },
            fail: (res) => {
                // 分包加载失败通过 fail 回调
                this.loadSubpackage()
            }
        })

        loadTask.onProgressUpdate(res => {
            console.log('下载进度', res.progress)
            console.log('已经下载的数据长度', res.totalBytesWritten)
            console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)

            this.perNum.text = Math.floor(res.progress / 2) + '%'
            this.bar.width = 560 * (res.progress / 50)
        })
    }

    loadRes() {
        //预加载3d资源
        var resUrl = [
            WxApi.UnityPath + 'line.lh',
            WxApi.UnityPath + 'Hero_1.lh',
            WxApi.UnityPath + 'Hero_Boss.lh',
            WxApi.UnityPath + 'Circle_1.lh',
            WxApi.UnityPath + 'hitFX.lh'
        ];
        for (let i = 0; i < 7; i++) {
            resUrl.push(WxApi.UnityPath + 'Arms_' + (i + 1) + '.lh')
        }
        for (let i = 0; i < 10; i++) {
            resUrl.push(WxApi.UnityPath + 'Hero' + (i + 1) + '_Emb.lh')
        }
        Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
    }

    onComplete() {
        GameLogic.Share.initScene()
        Laya.timer.once(1000, this, () => {
            let cb = () => {
                GameLogic.Share.createPlayer()
                GameLogic.Share.createAi()
            }
            Laya.Scene.open('MyScenes/GameUI.scene', true, cb)
            WxApi.aldEvent('进入首页')
        })
    }

    onProgress(value) {
        this.perNum.text = (50 + Math.floor(value * 50)) + '%'
        this.bar.width = (560 / 2) + 560 * value / 2
    }
}