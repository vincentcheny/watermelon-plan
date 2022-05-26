const {
    envList
} = require('../../envList.js');
const app = getApp();

Page({
    data: {
        envList,
        theme: 'white',
        selectedEnv: envList[0],
        userIntegral: 0,
        userName: undefined,
        openid: undefined,
        userAvatar: undefined,
        icon_location: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/theme',
        homeElement: {
            'achievement': {
                name: "成就"
            },
            'bag': {
                name: "奖励"
            },
            'whisper': {
                name: "悄悄话"
            },
            'game': {
                name: "游戏"
            },
            'todo': {
                name: "TODO"
            }
        },
    },

    onLoad(options) {
        if (wx.getStorageSync("openid") == 'oEe5y5X_7-M4dZnwAEDIJ1bfJyAQ') {
            let homeElement = this.data.homeElement;
            homeElement['manage'] = {name: '管理'};
            this.setData({homeElement})
        }
        let text = ['首页', '任务', '兑换', '我的']
        for (let i = 0; i < 4; i++) {
            wx.setTabBarItem({
                index: i,
                text: text[i],
                iconPath: '/image/icon/tabbar-' + i + '.png',
                selectedIconPath: '/image/icon/tabbar-' + i + '-selected.png',
            })
        }
        this.setData({
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
            userAvatar: wx.getStorageSync('avatar_url')
        });
        this.cacheAchievements();
        this.anniversaryCheck();
    },

    cacheAchievements() {
        var that = this;
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            config: {
                env: this.data.selectedEnv.envId
            },
            data: {
                type: 'getCollection',
                name: 'achievement'
            }
        }).then((res_achi) => {
            var achievements = new Object();
            for (var i in res_achi.result.data) {
                achievements[res_achi.result.data[i]._id] = res_achi.result.data[i];
            }
            wx.setStorageSync('achievements', achievements)
            that.setData({
                achievements: achievements
            });
        });
    },

    getAnniversary(date, year = 2021, month = 5, day = 27) {
        let anniversary;
        if (date.getMonth() > month || date.getMonth() == month && date.getDay() >= day) {
            anniversary = date.getFullYear() - year;
        } else {
            anniversary = date.getFullYear() - year - 1;
        }
        return anniversary
    },

    anniversaryCheck() {
        let that = this;
        let yesterday = new Date();
        let new_anni = this.getAnniversary(yesterday);
        yesterday.setDate(yesterday.getDate() - 1);
        let old_anni = this.getAnniversary(yesterday);
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        db.collection('user')
            .doc(wx.getStorageSync("_id"))
            .get({
                success: function (res) {
                    // cache unlock theme
                    let unlock_theme = {
                        white: true,
                        melon: true,
                        dog: res.data.achievement.includes('058dfefe627a11d7025ebd7077ab960d'),
                        star: res.data.achievement.includes('0a4ec1f9627a081302d18dd04bb0e556')
                    }
                    wx.setStorageSync('unlock_theme', unlock_theme);
                    for (var i in that.data.achievements) {
                        if (res.data.achievement.includes(i) && that.data.achievements[i].type == "year" && old_anni < that.data.achievements[i].num && new_anni >= that.data.achievements[i].num) {
                            var data_copy = that.data.achievements[i];
                            db.collection('user')
                                .doc(wx.getStorageSync("_id"))
                                .update({
                                    data: {
                                        achievement: db.command.push([data_copy._id]),
                                    },
                                    success: (res) => {
                                        wx.showModal({
                                            title: '╰(*°▽°*)╯恭喜！',
                                            content: wx.getStorageSync("user_name") + ' 达成 "' + data_copy.title + '"（' + data_copy.desc + '），去成就看下有什么奖励叭！',
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

    onShow: function () {
        this.setData({
            theme: app.globalData.theme,
            userIntegral: wx.getStorageSync("integral")
        });
        // 每次打开页面时根据theme更新图标
        for (let name in this.data.homeElement) {
            this.setData({
                ['homeElement.' + name + '.icon']: [this.data.icon_location, this.data.theme, name + '_cover.svg'].join('/'),
            });
        };
    },

    jumpPage(e) {
        wx.navigateTo({
            url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
        });
    },

});