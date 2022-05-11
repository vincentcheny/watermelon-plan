// pages/exchange/index.js
const {
    envList
} = require('../../envList.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        theme: 'light',
        selectedEnv: envList[0],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.setData({
            theme: wx.getSystemInfoSync().theme || 'light'
        });
        if (wx.onThemeChange) {
            wx.onThemeChange(({
                theme
            }) => {
                this.setData({
                    theme
                })
            })
        };
        this.refreshRewardList();
    },

    refreshRewardList() {
        wx.showLoading({
            title: '读取奖励列表',
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
                
                wx.cloud.callFunction({
                        name: 'quickstartFunctions',
                        config: {
                            env: this.data.selectedEnv.envId
                        },
                        data: {
                            type: 'getCollection',
                            name: 'reward'
                        }
                    })
                    .then((res) => {
                        var record = new Array();
                        var type_set = new Set();
                        var reward_name = undefined;
                        for (var reward of res.result.data) {
                            type_set.add(reward.type);
                            reward_name = reward.type == 'daily'?resp.result.data[0].daily_reward:resp.result.data[0].weekly_reward
                            record.push({
                                _id: reward._id,
                                reward_name: reward.name,
                                reward_score: reward.score,
                                type: reward.type,
                                is_finished: reward_name == undefined ? false : reward_name[reward._id] ?? false
                            })
                        };
                        record.sort((a,b) => {
                            if (a.is_finished !== b.is_finished) {
                                return a.is_finished == false ? -1 : 1;
                            } else {
                                return a.reward_name < b.reward_name ? -1 : 1;
                            }
                        });
                        this.setData({
                            type: Array.from(type_set).sort(),
                            record: record
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

    submitReward(e) {
        if (wx.getStorageSync("integral") < e.currentTarget.dataset.score) {
            wx.showModal({
                title: '提示',
                content: '积分不够哦，当前积分：'+wx.getStorageSync("integral")
              })
            return;
        }
        wx.showLoading({
            title: '正在大声地说我领了一项奖励',
        });
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        db.collection('user')
        .doc(wx.getStorageSync("_id"))
        .update({
            data: {
                [e.currentTarget.dataset.type + '_reward']: {
                    [e.currentTarget.id]: true
                }, 
                user_integral: db.command.inc((-1) * e.currentTarget.dataset.score)
            },
            success: (res) => {
                for (var idx in this.data.record) {
                    if (this.data.record[idx]._id == e.currentTarget.id) {
                        this.setData({
                            ['record['+idx+'].is_finished']: true
                        });
                        break;
                    }
                }
                var newScore = wx.getStorageSync("integral")-e.currentTarget.dataset.score;
                wx.setStorageSync('integral', newScore);
                this.setData({
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
                reward_name: e.currentTarget.dataset.name,
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
            userIntegral: wx.getStorageSync("integral"),
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
            // userAvatar: undefined
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
    onShareAppMessage: function (res) {
        console.log(res);
    }
})