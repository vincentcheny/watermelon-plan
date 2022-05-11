// pages/whisper/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        whisperText: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const db = wx.cloud.database();
        const user = db.collection('user');
        var that = this;
        user.where({
                _openid: wx.getStorageSync("openid")
            })
            .get({
                success: function (db_res) {
                    if (db_res.data.length > 0) {
                        that.setData({
                            whisperText: db_res.data[0].message
                        });
                    }
                },
                fail: function (db_res) {
                    console.log("Fail querying the message from db user");
                }
            })
    },

    formSubmit(e) {
        const db = wx.cloud.database();
        const user = db.collection('user');
        user.doc(wx.getStorageSync("_id")).update({
            data: {
                message: e.detail.value.textarea
            },
            success: function (res) {
                console.log('Update personal message successfully.');
                wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            fail: function (res) {
                console.log('Fail to update personal message.');
                console.log(res);
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
    },

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