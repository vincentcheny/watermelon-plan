// pages/query/index.js
const {
    envList
} = require('../../envList.js');
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        selectedEnv: envList[0],
        list: [{
            id: 'theme',
            name: '主题',
            icon: '/image/icon/theme.svg',
            open: false,
            items: [{
                value: 'white',
                name: '灰度'
            }, {
                value: 'melon',
                name: '西瓜'
            }, {
                value: 'dog',
                name: '玉桂狗'
            }, {
                value: 'star',
                name: '星之卡比'
            }]
        }],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        const list = this.data.list;
        for (var i in list[0].items) {
            if (list[0].items[i].value == app.globalData.theme) {
                list[0].items[i].checked = true
            } else {
                list[0].items[i].checked = false
            }
        }
        this.setData({
            list
        })
    },

    tabToggle(e) {
        const list = this.data.list;
        for (var i in list) {
            if (list[i].id == e.currentTarget.dataset.id) {
                list[i].open = !list[i].open
            }
        }
        this.setData({
            list
        })
    },

    radioChange(e) {
        if (e.currentTarget.dataset.id == 'theme') {
            wx.showLoading({
                title: '更新主题中...',
            });
            const db = wx.cloud.database({
                env: this.data.selectedEnv.envId
            })
            var that = this;
            db.collection('user')
                .doc(wx.getStorageSync("_id"))
                .update({
                    data: {
                        theme: e.detail.value
                    },
                    success: (res) => {
                        app.globalData.theme = e.detail.value;
                        that.setData({
                            theme: e.detail.value
                        });
                        wx.hideLoading();
                    },
                    fail: (res) => {
                        console.error(res);
                        wx.hideLoading();
                    }
                })
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            theme: app.globalData.theme
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})