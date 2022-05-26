// pages/whisper/index.js
const {
    envList
} = require('../../../envList.js');
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        whisperText: "",
        theme: 'white',
        selectedEnv: envList[0],
        rgb: {
            white: '#aa9aaa',
            melon: '#07c160',
            dog: '#4eb4dd',
            star: '#c2a2a8'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            openid: wx.getStorageSync("openid"),
            theme: app.globalData.theme
        });
        var that = this;
        wx.cloud.callFunction({
                name: 'quickstartFunctions',
                config: {
                    env: this.data.selectedEnv.envId
                },
                data: {
                    type: 'getUserByOpenId',
                    data: {
                        openid: this.data.openid
                    }
                }
            })
            .then((resp) => {
                if (resp.result.data.length > 0) {
                    that.setData({
                        whisperText: resp.result.data[0].message
                    });
                }

            }).catch((e) => {
                console.log("Fail querying the message from db user. ", e);
            })
    },

    formSubmit(e) {
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            config: {
                env: this.data.selectedEnv.envId
            },
            data: {
                type: 'updateCollection',
                data: {
                    id: wx.getStorageSync("_id"),
                    collection_name: 'user',
                    update_objects: {
                        message: {
                            type: 'set',
                            value: e.detail.value.textarea
                        }
                    }
                }
            }
        }).then((resp) => {
            wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
            })
        }).catch((e) => {
            console.error(e);
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})