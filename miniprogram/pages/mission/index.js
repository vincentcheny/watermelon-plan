// pages/mission/index.js
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
        titles: [],
        icon_type: 'light',
        selectedEnv: envList[0],
        type: [],
        records: [],
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
        this.refreshList('mission');
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
                            switch (data.type) {
                                case 'daily':
                                    data_name = resp.result.data[0].daily_mission;
                                    break;
                                case 'weekly':
                                    data_name = resp.result.data[0].weekly_mission;
                                    break;
                                case 'xothers':
                                    data_name = resp.result.data[0].xothers_mission;
                                    break;
                            }
                            records.push({
                                _id: data._id,
                                name: data.name,
                                content: data.score,
                                type: data.type,
                                comment: data.comment,
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
                            titles: [{
                                    daily: '每日任务',
                                    weekly: '每周任务',
                                    xothers: '其它任务'
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

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    submit(data) {
        wx.showLoading({
            title: '完成了一项任务',
        });
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        const _ = db.command;
        var that = this;
        db.collection('user')
            .doc(wx.getStorageSync("_id"))
            .get({
                success: function (res) {
                    var lastTime = new Date(new Date(res.data.achievement_data.last_mission).setHours(0)).setMinutes(0, 0, 0);
                    var curTime = new Date(new Date().setHours(0)).setMinutes(0, 0, 0);
                    var curCombo;
                    let dayDiff = (curTime - lastTime) / (1 * 24 * 60 * 60 * 1000) == 1;
                    if (dayDiff == 1) {
                        curCombo = res.data.achievement_data.cur_mission_combo + 1;
                    } else if (dayDiff == 0) {
                        curCombo = res.data.achievement_data.cur_mission_combo;
                    } else {
                        curCombo = 1;
                    }
                    data.detail.item_score = parseInt(data.detail.item_content);
                    wx.cloud.callFunction({
                        name: 'quickstartFunctions',
                        config: {
                            env: that.data.selectedEnv.envId
                        },
                        data: {
                            type: 'updateCollection',
                            data: {
                                id: wx.getStorageSync("_id"),
                                collection_name: 'user',
                                update_objects: {
                                    [data.detail.item_type + '_mission.' + data.detail.item_id]: {
                                        type: 'set',
                                        value: true
                                    },
                                    user_integral: {
                                        type: 'add',
                                        value: data.detail.item_score
                                    },
                                    ['achievement_data.total_integral']: {
                                        type: 'add',
                                        value: data.detail.item_score
                                    },
                                    ['achievement_data.last_mission']: {
                                        type: 'set',
                                        value: new Date() / 1
                                    },
                                    ['achievement_data.cur_mission_combo']: {
                                        type: 'set',
                                        value: curCombo
                                    },
                                    ['achievement_data.max_mission_combo']: {
                                        type: 'set',
                                        value: Math.max(curCombo, res.data.achievement_data.max_mission_combo)
                                    }
                                }
                            }
                        }
                    }).then((resp) => {
                        if (resp.result.stats.updated != 1) {
                            wx.showModal({
                                title: '错误',
                                content: '数据库更新失败',
                                showCancel: false
                            });
                            return
                        }
                        for (var idx in that.data.records) {
                            if (that.data.records[idx]._id == data.detail.item_id) {
                                that.setData({
                                    ['records[' + idx + '].is_finished']: true
                                });
                                wx.showModal({
                                    title: '提示',
                                    content: '完成了 "' + data.detail.item_name + '" ！',
                                    showCancel: false
                                });
                                break;
                            }
                        }
                        var newScore = wx.getStorageSync("integral") + data.detail.item_score;
                        that.setData({
                            userIntegral: newScore
                        });
                        wx.setStorageSync('integral', newScore);
                        wx.hideLoading();

                        // 成就检测
                        var achievements = wx.getStorageSync('achievements');
                        for (var i in achievements) {
                            if (achievements[i].type == "score" && res.data.achievement_data.total_integral < achievements[i].num && res.data.achievement_data.total_integral + data.detail.item_score >= achievements[i].num ||
                                achievements[i].type == "day" && res.data.achievement_data.cur_mission_combo < achievements[i].num && curCombo >= achievements[i].num) {
                                var data_copy = achievements[i];
                                wx.cloud.callFunction({
                                    name: 'quickstartFunctions',
                                    config: {
                                        env: that.data.selectedEnv.envId
                                    },
                                    data: {
                                        type: 'updateCollection',
                                        data: {
                                            id: wx.getStorageSync("_id"),
                                            collection_name: 'user',
                                            update_objects: {
                                                achievement: {
                                                    type: 'push',
                                                    value: data_copy._id
                                                }
                                            }
                                        }
                                    }
                                }).then((resp) => {
                                    wx.showModal({
                                        title: '╰(*°▽°*)╯恭喜！',
                                        content: wx.getStorageSync("user_name") + ' 达成 "' + data_copy.title + '"（' + data_copy.desc + '），去成就看下有什么奖励叭！',
                                        showCancel: false
                                    });
                                }).catch((e) => {
                                    console.error(e);
                                });
                            }
                        }
                    }).catch((e) => {
                        console.error(e);
                    });
                }
            })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            theme: app.globalData.theme,
            userIntegral: wx.getStorageSync("integral"),
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name")
        });
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
        this.refreshList('mission');
        setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 1000)
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