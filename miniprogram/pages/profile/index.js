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
        theme: 'white',
        selectedEnv: envList[0],
        list: [{
            id: 'theme',
            name: '主题',
            icon: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/icon/theme.svg',
            open: false,
            items: [{
                value: 'white',
                name: '灰玫瑰'
            }, {
                value: 'melon',
                name: '西西瓜'
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
            list,
            theme: app.globalData.theme
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
            var that = this;
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
                            theme: {
                                type: 'set',
                                value: e.detail.value
                            }
                        }
                    }
                }
            }).then((resp) => {
                app.globalData.theme = e.detail.value;
                that.setData({
                    theme: e.detail.value
                });
                wx.hideLoading();
                let text = ['首页', '任务', '兑换', '我的']
                if (['white', 'melon'].includes(e.detail.value)) {
                    for (let i = 0; i < 4; i++) {
                        wx.setTabBarItem({
                            index: i,
                            text: text[i],
                            iconPath: '/image/icon/tabbar-' + i + '.png',
                            selectedIconPath: '/image/icon/tabbar-' + i + '-selected.png',
                        })
                    }
                } else {
                    for (let i = 0; i < 4; i++) {
                        wx.setTabBarItem({
                            index: i,
                            text: text[i],
                            iconPath: '/image/theme/' + e.detail.value + '/tabbar-' + i + '.png',
                            selectedIconPath: '/image/theme/' + e.detail.value + '/tabbar-' + i + '-selected.png'
                        })
                    }
                }
            }).catch((e) => {
                console.error(e);
                wx.hideLoading();
            });
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
            theme: app.globalData.theme,
            unlock_theme: wx.getStorageSync('unlock_theme')
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