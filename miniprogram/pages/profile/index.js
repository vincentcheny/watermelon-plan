// pages/query/index.js

Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: ['1'],
        records: ['2'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            slideButtons: [{
                text: '普通',
            }, {
                text: '普通',
                extClass: 'test',
            }, {
                type: 'warn',
                text: '警示',
                extClass: 'test',
            }],
        });
    },
    slideButtonTap(e) {
        console.log('slide button tap', e.detail)
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