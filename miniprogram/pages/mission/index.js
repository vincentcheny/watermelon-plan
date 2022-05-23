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
        chartData: {},
        type: [],
        records: [],
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
                            data_name = data.type == 'daily' ? resp.result.data[0].daily_mission : resp.result.data[0].weekly_mission
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
                            titles: [{
                                    daily: '每日任务',
                                    weekly: '每周任务',
                                    others: '其它任务'
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
                    db.collection('user')
                        .doc(wx.getStorageSync("_id"))
                        .update({
                            data: {
                                [data.detail.item_type + '_mission']: {
                                    [data.detail.item_id]: true
                                },
                                user_integral: _.inc(data.detail.item_score),
                                ['achievement_data.total_integral']: _.inc(data.detail.item_score),
                                ['achievement_data.last_mission']: new Date() / 1,
                                ['achievement_data.cur_mission_combo']: curCombo,
                                ['achievement_data.max_mission_combo']: Math.max(curCombo, res.data.achievement_data.max_mission_combo)
                            },
                            success: (resp) => {
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
                                wx.cloud.callFunction({
                                    name: 'quickstartFunctions',
                                    config: {
                                        env: that.data.selectedEnv.envId
                                    },
                                    data: {
                                        type: 'getAchievementByType',
                                        data: {
                                            type: ["score", "day"]
                                        }
                                    }
                                }).then((res_achi) => {
                                    for (var i in res_achi.result.data) {
                                        if (res_achi.result.data[i].type == "score" && res.data.achievement_data.total_integral < res_achi.result.data[i].num && res.data.achievement_data.total_integral + data.detail.item_score >= res_achi.result.data[i].num ||
                                            res_achi.result.data[i].type == "day" && res.data.achievement_data.cur_mission_combo < res_achi.result.data[i].num && curCombo >= res_achi.result.data[i].num) {
                                            var data_copy = res_achi.result.data[i];
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
                                })
                            },
                            fail: (resp) => {
                                console.log(resp);
                            }
                        })
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