// pages/game/index.js
const {
    envList
} = require('../../../envList.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        theme: 'light',
        selectedEnv: envList[0],
        comboScore: 5
    },

    gamble(e) {

        if (this.data.userIntegral < 20) {
            wx.showModal({
                title: '提示',
                content: '当前🐔分不足20',
                showCancel: false
            });
            return;
        }
        var newScore = 0;
        var addPercent = parseFloat(e.currentTarget.dataset.addPercent);
        var minusPercent = parseFloat(e.currentTarget.dataset.minusPercent);
        var isWin = false;
        var that = this;
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        wx.showLoading({
            title: '抽奖中',
        });
        if (Math.random() > 0.45) {
            newScore = Math.ceil(this.data.userIntegral * (1 + addPercent));
            isWin = true;
        } else {
            newScore = Math.ceil(this.data.userIntegral * (1 - minusPercent));
        }
        db.collection('user')
            .doc(wx.getStorageSync("_id"))
            .get()
            .then((resp) => {
                if (resp.data.gamble_limit <= 0) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: '今日抽奖上限已达~',
                        showCancel: false
                    });
                    return;
                }
                var gambleCombo = 0;
                var content = '恭喜获得加分！';
                if (resp.data.gamble_combo <= -2) {
                    newScore = resp.data.user_integral;
                    gambleCombo = 0;
                    content = '使用防御卡抵消扣分！';
                } else if (!isWin && resp.data.gamble_combo == -1) {
                    gambleCombo = resp.data.gamble_combo - 1;
                    content = '获得防御卡！';
                } else if (!isWin) {
                    gambleCombo = resp.data.gamble_combo - 1;
                    content = '有点可惜，再接再厉！';
                } else if (resp.data.gamble_combo >= 1 && resp.data.gamble_combo % 2 == 1) {
                    newScore += that.data.comboScore;
                    gambleCombo = 0;
                    content = '连击追加 ' + that.data.comboScore.toString() + ' 分！'
                } else {
                    gambleCombo = Math.max(resp.data.gamble_combo + 1, 1);
                }
                var oldScore = that.data.userIntegral;
                db.collection('user')
                    .doc(wx.getStorageSync("_id"))
                    .update({
                        data: {
                            user_integral: newScore,
                            gamble_combo: gambleCombo,
                            gamble_limit: db.command.inc(-1),
                            ['achievement_data.num_game']: db.command.inc(1),
                            ['achievement_data.num_200_game']: db.command.inc(oldScore > 200 ? 1 : 0),
                            ['achievement_data.num_1000_game']: db.command.inc(oldScore > 1000 ? 1 : 0)
                        },
                        success: (res) => {},
                        fail: (res) => {
                            console.error(res);
                        }
                    });

                setTimeout(function () {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: content + resp.data.user_integral.toString() + ' -> ' + newScore.toString(),
                        showCancel: false,
                        success(res) {
                            // 游戏成就检测
                            wx.cloud.callFunction({
                                name: 'quickstartFunctions',
                                config: {
                                    env: that.data.selectedEnv.envId
                                },
                                data: {
                                    type: 'getAchievementByType',
                                    data: {
                                        type: "game"
                                    }
                                }
                            }).then((res_achi) => {
                                for (var i in res_achi.result.data) {
                                    var data = res_achi.result.data[i];
                                    if (data.level == 0 && resp.data.achievement_data.num_game + 1 == data.num ||
                                        data.level == 1 && oldScore > 200 && resp.data.achievement_data.num_200_game + 1 == data.num ||
                                        data.level == 2 && oldScore > 1000 && resp.data.achievement_data.num_1000_game + 1 == data.num) {
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
                            });
                        }
                    });
                    that.setData({
                        userIntegral: newScore
                    });
                    wx.setStorageSync('integral', newScore);
                }, 1200);
            })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
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
        this.setData({
            userIntegral: wx.getStorageSync("integral")
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