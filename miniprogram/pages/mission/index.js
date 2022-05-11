// pages/mission/index.js
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
        chartData: {},
        //您可以通过修改 config-ucharts.js 文件中下标为 ['line'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
        opts: {
            color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
            padding: [15, 10, 0, 15],
            legend: {},
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                gridType: "dash",
                dashLength: 2
            },
            extra: {
                line: {
                    type: "curve",
                    width: 2
                }
            }
        }
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
        this.refreshExchangeList();
    },

    refreshExchangeList() {
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
                            name: 'mission'
                        }
                    })
                    .then((res) => {
                        var record = new Array();
                        var type_set = new Set();
                        var mission_name = undefined;
                        for (var mission of res.result.data) {
                            type_set.add(mission.type);
                            mission_name = mission.type == 'daily' ? resp.result.data[0].daily_mission : resp.result.data[0].weekly_mission
                            record.push({
                                _id: mission._id,
                                mission_content: mission.name,
                                mission_score: mission.score,
                                type: mission.type,
                                is_finished: mission_name[mission._id] ?? false
                            })
                        };
                        record.sort((a, b) => {
                            if (a.is_finished !== b.is_finished) {
                                return a.is_finished == false ? -1 : 1;
                            } else {
                                return a.mission_content < b.mission_content ? -1 : 1;
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

    submitMission(e) {
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
                    var curCombo = (curTime - lastTime) / (1 * 24 * 60 * 60 * 1000) == 1 ? res.data.achievement_data.cur_mission_combo + 1 : 1;
                    db.collection('user')
                        .doc(wx.getStorageSync("_id"))
                        .update({
                            data: {
                                [e.currentTarget.dataset.type + '_mission']: {
                                    [e.currentTarget.id]: true
                                },
                                user_integral: _.inc(e.currentTarget.dataset.score),
                                ['achievement_data.total_integral']: _.inc(e.currentTarget.dataset.score),
                                ['achievement_data.last_mission']: new Date() / 1,
                                ['achievement_data.cur_mission_combo']: curCombo,
                                ['achievement_data.max_mission_combo']: Math.max(curCombo, res.data.achievement_data.max_mission_combo)
                            },
                            success: (resp) => {
                                for (var idx in that.data.record) {
                                    if (that.data.record[idx]._id == e.currentTarget.id) {
                                        that.setData({
                                            ['record[' + idx + '].is_finished']: true
                                        });
                                        break;
                                    }
                                }
                                var newScore = wx.getStorageSync("integral") + e.currentTarget.dataset.score;
                                wx.setStorageSync('integral', newScore);
                                that.setData({
                                    userIntegral: newScore
                                });
                                wx.hideLoading();
                                // 成就检测
                                const achievement = db.collection('achievement');
                                achievement.where({
                                        type: _.or("score", "day")
                                    })
                                    .get({
                                        success: function (res_achi) {
                                            for (var i in res_achi.data) {
                                                var data = res_achi.data[i];
                                                if (data.type == "score" && res.data.achievement_data.total_integral < data.num && res.data.achievement_data.total_integral + e.currentTarget.dataset.score >= data.num ||
                                                    data.type == "day" && res.data.achievement_data.cur_mission_combo < data.num && curCombo >= data.num) {
                                                    var data_copy = data;
                                                    db.collection('user')
                                                        .doc(wx.getStorageSync("_id"))
                                                        .update({
                                                            data: {
                                                                achievement: db.command.push([data_copy._id]),
                                                            },
                                                            success: (res) => {
                                                                wx.showModal({
                                                                    title: '╰(*°▽°*)╯恭喜！',
                                                                    content: wx.getStorageSync("user_name") + ' 达成成就"' + data_copy.title + '"（' + data_copy.desc + '）',
                                                                    showCancel: false
                                                                });
                                                            },
                                                            fail: (res) => {
                                                                console.error(res);
                                                            }
                                                        });
                                                }
                                            }
                                        }
                                    })
                            }

                            // },
                            // fail: (res) => {
                            //     console.error(res);
                            //     wx.hideLoading();
                            // }
                        })
                }
            })

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.getServerData();
    },

    getServerData() {
        //模拟从服务器获取数据时的延时
        setTimeout(() => {
            //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
            let res = {
                categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
                series: [{
                        name: "成交量A",
                        data: [35, 8, 25, 37, 4, 20]
                    },
                    {
                        name: "成交量B",
                        data: [70, 40, 65, 100, 44, 68]
                    },
                    {
                        name: "成交量C",
                        data: [100, 80, 95, 150, 112, 132]
                    }
                ]
            };
            this.setData({
                chartData: JSON.parse(JSON.stringify(res))
            });
        }, 500);
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
    onShareAppMessage: function () {

    }
})