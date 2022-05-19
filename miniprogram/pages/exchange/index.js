// pages/exchange/index.js
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
        type: [],
        records: [],
        theme: 'white',
        titles: [],
        icon_type: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        wx.onThemeChange((res) => {
            this.setData({
                icon_type: res.theme == 'dark' ? 'dark' : 'light'
            });
        })
        this.refreshList('reward');
    },
    
    refreshList(collectionName) {
        wx.showLoading({
            title: '读取任务列表',
        });
        this.setData({
            openid: wx.getStorageSync("openid")
        })
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
                if (resp.result.data.length == 0) {
                    throw new Error("Return list is empty. No corresponding openid in the database.")
                }
                wx.setStorageSync('_id', resp.result.data[0]._id)
                wx.cloud.callFunction({
                        name: 'quickstartFunctions',
                        config: {
                            env: this.data.selectedEnv.envId
                        },
                        data: {
                            type: 'getCollection',
                            name: collectionName
                        }
                    })
                    .then((res) => {
                        var records = new Array();
                        var type_set = new Set();
                        var data_name = undefined;
                        for (var data of res.result.data) {
                            type_set.add(data.type);
                            data_name = data.type == 'daily' ? resp.result.data[0].daily_reward : resp.result.data[0].weekly_reward;
                            records.push({
                                _id: data._id,
                                name: data.name,
                                content: data.score,
                                type: data.type,
                                is_finished: data_name[data._id] ?? false
                            })
                        };
                        records.sort((a, b) => {
                            if (a.is_finished !== b.is_finished) {
                                return a.is_finished == false ? -1 : 1;
                            } else {
                                return a.name < b.name ? -1 : 1;
                            }
                        });
                        this.setData({
                            type: Array.from(type_set).sort(),
                            records: records,
                            titles: [
                                {
                                    daily: '每日兑换',
                                    weekly: '每周兑换',
                                    others: '其它兑换'
                                },
                                '积分'
                            ]
                        });
                        wx.hideLoading();
                    }).catch((e) => {
                        console.log(e);
                        wx.hideLoading();
                    });
            }).catch((e) => {
                console.log(e);
                wx.hideLoading();
            });
    },

    submit(data) {
        data.detail.item_score = parseInt(data.detail.item_content);
        if (wx.getStorageSync("integral") < data.detail.item_score) {
            wx.showModal({
                title: '提示',
                content: '积分不够哦，当前积分：'+wx.getStorageSync("integral")
              })
            return;
        }
        wx.showLoading({
            title: '正在领取奖励',
        });
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        var that = this;
        db.collection('user')
        .doc(wx.getStorageSync("_id"))
        .update({
            data: {
                [data.detail.item_type + '_reward']: {
                    [data.detail.item_id]: true
                }, 
                user_integral: db.command.inc((-1) * data.detail.item_score)
            },
            success: (res) => {
                for (var idx in that.data.records) {
                    if (that.data.records[idx]._id == data.detail.item_id) {
                        that.setData({
                            ['records['+idx+'].is_finished']: true
                        });
                        wx.showModal({
                            title: '提示',
                            content: '领取了 "' + data.detail.item_name + '" ！',
                            showCancel: false
                        });
                        break;
                    }
                }
                var newScore = wx.getStorageSync("integral")-data.detail.item_score;
                wx.setStorageSync('integral', newScore);
                that.setData({
                    userIntegral: newScore
                });
                wx.hideLoading();
            },
            fail: (res) => {
                console.error(res);
                wx.hideLoading();
            }
        });
        db.collection('bag')
        .add({
            data: {
                reward_name: data.detail.item_name,
                time: new Date() / 1
            }
        });
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
            userIntegral: wx.getStorageSync("integral"),
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
            // userAvatar: undefined
        })
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    icon_type: res.theme == 'dark' ? 'dark' : 'light'
                });
            }
        });
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
    onShareAppMessage: function (res) {
        console.log(res);
    }
})