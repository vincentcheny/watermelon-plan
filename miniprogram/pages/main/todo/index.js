// pages/main/todo/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        theme: 'white',
        records: [],
        slideButtonSend: [{
            extClass: 'icon',
            src: '/image/icon/send.svg'
        }],
        slideButtonAdd: [{
            extClass: 'icon',
            src: '/image/icon/add.svg'
        }],
        inputValue: '',
        addtext: '',
        title: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            title: wx.getStorageSync('user_name') + ' の TODO LIST'
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
        this.refreshList()
    },

    refreshList() {
        wx.showLoading({
            title: '读取 TODO 列表',
        });
        this.setData({
            openid: wx.getStorageSync("openid")
        })
        var that = this;
        const db = wx.cloud.database();
        const user = db.collection('user');
        user.doc(wx.getStorageSync("_id"))
            .get({
                success: function (res_db) {
                    that.setData({
                        records: res_db.data.todo
                    })
                    wx.hideLoading();
                }
            })
    },

    deleteTodo(e) {
        var that = this;
        let new_array = this.data.records.filter(
            function (item) {
                return item.exacttime != e.currentTarget.dataset.time
            }
        );
        const db = wx.cloud.database();
        const user = db.collection('user');
        user.doc(wx.getStorageSync("_id"))
            .update({
                data: {
                    todo: new_array
                },
                success: function (res) {
                    that.setData({
                        records: new_array
                    })
                    wx.showModal({
                        title: '提示',
                        content: (res.stats.updated == 0 ? '未成功删除 ' : '成功删除 ') + e.currentTarget.dataset.content,
                        showCancel: false
                    });
                }
            })
    },

    addTodo(e) {
        var that = this;
        let cur = new Date() / 1;
        const db = wx.cloud.database();
        const user = db.collection('user');
        user.doc(wx.getStorageSync("_id"))
            .update({
                data: {
                    todo: db.command.push([{
                        content: this.data.inputValue,
                        exacttime: cur
                    }])
                },
                success: function (res) {
                    let new_array = that.data.records;
                    new_array.push({
                        content: that.data.inputValue,
                        exacttime: cur
                    })
                    wx.showModal({
                        title: '提示',
                        content: (res.stats.updated == 0 ? '未成功添加 ' : '成功添加 ') + that.data.inputValue,
                        showCancel: false,
                        success: (res) => {
                            that.setData({
                                records: new_array,
                                addtext: '',
                                inputValue: ''
                            })
                        },
                    });
                },
                fail: function (res) {
                    console.log(res);
                }
            })
    },

    bindInput(e) {
        this.setData({
            inputValue: e.detail.value
        })
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