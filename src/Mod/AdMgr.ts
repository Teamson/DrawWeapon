import Utility from "./Utility";
import WxApi from "../Libs/WxApi";
import ShareMgr from "./ShareMgr";
import JJMgr from "../JJExport/Common/JJMgr";

export default class AdMgr {
    private static _instance: AdMgr
    public static get instance(): AdMgr {
        if (!this._instance) {
            this._instance = new AdMgr()
        }
        return this._instance
    }

    private bannerUnitId: string[] = ['adunit-441b22cb32c3f6b7', 'adunit-ca1d1fda0b8c4a03']
    private videoUnitId: string = 'adunit-c35dcf999bc0fcf3'
    private bannerAd: any = null
    private videoAd: any = null
    public videoCallback: Function = null
    private curBannerId: number = 0
    public showBannerCount: number = 0

    private videoIsError: boolean = false
    private videoLoaded: boolean = false

    initAd() {
        if (Laya.Browser.onWeiXin) {
            this.initBanner()
            this.initVideo()
        }
    }

    //初始化banner
    initBanner() {
        //适配iphoneX
        let isIphonex = false
        if (Laya.Browser.onWeiXin) {
            Laya.Browser.window.wx.getSystemInfo({
                success: res => {
                    let modelmes = res.model
                    if (modelmes.search('iPhone X') != -1) {
                        isIphonex = true
                    }
                }
            })
        }

        let winSize = Laya.Browser.window.wx.getSystemInfoSync()

        //初始化banner
        this.bannerAd = Laya.Browser.window.wx.createBannerAd({
            adUnitId: this.bannerUnitId[this.curBannerId],
            style: {
                left: 0,
                top: 0,
                width: 0,
                height: 300
            }
        })
        //监听banner尺寸修正
        this.bannerAd.onResize(res => {
            if (isIphonex) {
                this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight - 10
            } else {
                this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight
            }
            this.bannerAd.style.left = winSize.windowWidth / 2 - this.bannerAd.style.realWidth / 2
        })

        this.bannerAd.onError(res => {
            // 错误事件
            console.log('banner error:', JSON.stringify(res))
        })
    }
    //隐藏banner
    hideBanner(isCount: boolean = true) {
        if (Laya.Browser.onWeiXin) {
            this.bannerAd.hide()

            if (JJMgr.instance.dataConfig != null && this.showBannerCount >= parseInt(JJMgr.instance.dataConfig.front_banner_number) && isCount) {
                this.showBannerCount = 0
                this.curBannerId++
                if (this.curBannerId >= this.bannerUnitId.length) {
                    this.curBannerId = 0
                }

                console.log('destroy banner')
                this.bannerAd.destroy()
                this.bannerAd = null
                this.initBanner()
            }
        }
    }

    // countBanner() {
    //     if (JJMgr.instance.dataConfig != null && this.showBannerCount > parseInt(JJMgr.instance.dataConfig.front_banner_number)) {
    //         this.bannerAd.hide()
    //         this.showBannerCount = 0
    //         this.curBannerId++
    //         if (this.curBannerId >= this.bannerUnitId.length) {
    //             this.curBannerId = 0
    //         }

    //         console.log('destroy banner')
    //         this.bannerAd.destroy()
    //         this.bannerAd = null
    //         this.initBanner()
    //         this.showBanner()
    //     }
    // }

    //显示banner
    showBanner() {
        if (Laya.Browser.onWeiXin) {
            this.showBannerCount++
            this.bannerAd.show()
        }
    }
    //销毁banner
    destroyBanner() {
        if (Laya.Browser.onWeiXin && this.bannerAd) {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
    }

    initVideo() {
        if (!Laya.Browser.onWeiXin) {
            return
        }
        //初始化视频
        if (!this.videoAd) {
            this.videoAd = Laya.Browser.window.wx.createRewardedVideoAd({
                adUnitId: this.videoUnitId
            })
        }

        this.loadVideo()
        this.videoAd.onLoad(() => {
            console.log('激励视频加载成功')
            this.videoLoaded = true
        })
        //视频加载出错
        this.videoAd.onError(res => {
            console.log('video Error:', JSON.stringify(res))
            this.videoIsError = true
        })
    }

    loadVideo() {
        if (Laya.Browser.onWeiXin && this.videoAd != null) {
            this.videoIsError = false
            this.videoAd.load()
        }
    }

    //初始化激励视频
    showVideo(cb: Function) {
        this.videoCallback = cb
        if (!Laya.Browser.onWeiXin) {
            this.videoCallback()
            return
        }

        if (this.videoIsError) {
            ShareMgr.instance.shareGame(cb)
            this.loadVideo()
            return
        }

        if (this.videoLoaded == false) {
            WxApi.OpenAlert('视频正在加载中！')
            return
        }

        if (this.videoAd) {
            this.videoAd.offClose()
        }
        //关闭声音
        Laya.SoundManager.muted = true
        //监听关闭视频
        this.videoAd.onClose(res => {
            if (res && res.isEnded || res === undefined) {
                console.log('正常播放结束，可以下发游戏奖励')
                this.videoCallback()
            }
            else {
                console.log('播放中途退出，不下发游戏奖励')
            }
            //恢复声音
            Laya.SoundManager.muted = false
            this.videoLoaded = false
            this.loadVideo()
        })

        this.videoAd.show()
    }

}