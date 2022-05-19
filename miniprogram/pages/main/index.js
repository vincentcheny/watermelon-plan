const {
    envList
} = require('../../envList.js');
const app = getApp();

Page({
    data: {
        envList,
        selectedEnv: envList[0],
        userIntegral: 0,
        userName: undefined,
        openid: undefined,
        userAvatar: undefined,
        icon_location: '/../image/theme',
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
            'manage': {
                name: "管理"
            },
        },
    },

    getAnniversary(date, year=2021, month=5, day=27) {
        let anniversary;
        if (date.getMonth() > month || date.getMonth() == month && date.getDay() >= day) {
            anniversary = date.getFullYear() - year;
        } else {
            anniversary = date.getFullYear() - year - 1;
        }
        return anniversary
    },

    onLoad(options) {
        this.setData({
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
        });
        // 周年成就检测
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        const achievement = db.collection('achievement');
        achievement.where({
                type: "year"
            })
            .get({
                success: function (res_achi) {
                    let yesterday = new Date();
                    let new_anni = this.getAnniversary(yesterday);
                    yesterday.setDate(yesterday.getDate()-1);
                    let old_anni = this.getAnniversary(yesterday);
                    for (var i in res_achi.data) {
                        if (old_anni < res_achi.data[i].num && new_anni >= res_achi.data[i].num) {
                            var data_copy = res_achi.data[i];
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