// pages/achievement/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        theme: 'white',
        icon_location: '/../image/theme',
        showIntro: false,
        msg: undefined
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.theme) {
            this.setData({
                theme: options.theme
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        const db = wx.cloud.database();
        const user = db.collection('user');
        const achievement = db.collection('achievement');
        var that = this;
        achievement.limit(20)
            .get({
                success: function (res_achi) {
                    var achievements = new Object();
                    for (var i in res_achi.data) {
                        res_achi.data[i].done = false;
                        achievements[res_achi.data[i]._id] = res_achi.data[i];
                    }
                    that.setData({
                        achievements: achievements
                    });
                    user.doc(wx.getStorageSync("_id"))
                        .get({
                            success: function (res_db) {
                                function updateProgress(id, itemData, itemThreshold) {
                                    that.setData({
                                        ['achievements.' + id + '.percent']: Math.min(Math.floor(itemData / itemThreshold * 100)),
                                        ['achievements.' + id + '.progress']: itemData + '/' + itemThreshold
                                    });
                                }
                                var ids = res_db.data.achievement;
                                var scoreIds = [
                                    "0a4ec1f9627a081302d18dd04bb0e556",
                                    "f6e08a64627a08c0021cf46611dc1a2c",
                                    "058dfefe627a08d8025c948251bf6024"
                                ];
                                var gameItemData = {
                                    "0a4ec1f9627a099802d52eeb06c38f94": res_db.data.achievement_data.num_game,
                                    "0a4ec1f9627a09ce02d5938c608b40af": res_db.data.achievement_data.num_200_game,
                                    "16db756f627a09e301e21db44a24d850": res_db.data.achievement_data.num_1000_game
                                };
                                var dayIds = [
                                    "058dfefe627a11d7025ebd7077ab960d",
                                    "0a4ec1f9627a122c02d7378025671960",
                                    "058dfefe627a1356025ee56f24f719d0"
                                ];
                                for (var id in that.data.achievements) {
                                    if (ids.includes(id)) {
                                        // 高亮已获得成就
                                        that.setData({
                                            ['achievements.' + id + '.done']: true
                                        });
                                    }
                                    // 判断成就
                                    if (scoreIds.includes(id)) {
                                        updateProgress(id, res_db.data.achievement_data.total_integral, that.data.achievements[id].num);
                                    } else if (id in gameItemData) {
                                        updateProgress(id, gameItemData[id], that.data.achievements[id].num);
                                    } else if (dayIds.includes(id)) {
                                        updateProgress(id, res_db.data.achievement_data.max_mission_combo, that.data.achievements[id].num);
                                    }
                                }
                            },
                            fail: function (res_db) {
                                console.log("Fail querying the message from db user");
                            }
                        });
                    that.setData({
                        undone_icon: [that.data.icon_location, that.data.theme, 'achievement_undone.svg'].join('/'),
                        done_icon: [that.data.icon_location, that.data.theme, 'achievement_done'].join('/')
                    });
                }
            });
    },

    press(e) {
        for (var i in this.data.achievements) {
            if (this.data.achievements[i]._id == e.currentTarget.dataset.id) {
                this.setData({
                    showIntro: true,
                    msg: '《'+this.data.achievements[i].title+'》\n\n'+this.data.achievements[i].prize ?? '？？？'
                });
            }
        }
        
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