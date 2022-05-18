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
        theme: 'no',
        selectedEnv: envList[0],
        list: [{
            id: 'theme',
            name: '主题',
            icon: '/image/icon/theme.svg',
            open: false,
            items: [{
                value: 'white',
                name: '简约',
                checked: 'true'
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
    onLoad: function (options) {

    },

    tagToggle(e) {
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

    radioChange(e){
        if (e.currentTarget.dataset.id == 'theme') {
            app.globalData.theme = e.detail.value
            this.setData({
                theme: e.detail.value
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