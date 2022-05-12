// components/list/index.js
const {
    envList
} = require('../../envList.js');

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        types: {
            type: Array,
            value: []
        },

        records: {
            type: Array,
            value: []
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        selectedEnv: envList[0],
    },

    /**
     * 组件的方法列表
     */
    methods: {
        submit(e) {
            console.log(this);
            return
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
                        e.currentTarget.dataset.score = parseInt(e.currentTarget.dataset.score);
                        db.collection('user')
                            .doc(wx.getStorageSync("_id"))
                            .update({
                                data: {
                                    [e.currentTarget.dataset.type + '_mission']: {
                                        [e.currentTarget.dataset.id]: true
                                    },
                                    user_integral: _.inc(e.currentTarget.dataset.score),
                                    ['achievement_data.total_integral']: _.inc(e.currentTarget.dataset.score),
                                    ['achievement_data.last_mission']: new Date() / 1,
                                    ['achievement_data.cur_mission_combo']: curCombo,
                                    ['achievement_data.max_mission_combo']: Math.max(curCombo, res.data.achievement_data.max_mission_combo)
                                },
                                success: (resp) => {
                                    for (var idx in that.data.records) {
                                        if (that.data.records[idx]._id == e.currentTarget.id) {
                                            that.setData({
                                                ['records[' + idx + '].is_finished']: true // 这里没有从组件传回本体
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
                                },
                                fail: (resp) => {
                                    console.log(resp);
                                }
                            })
                    }
                })
        }
    }
})