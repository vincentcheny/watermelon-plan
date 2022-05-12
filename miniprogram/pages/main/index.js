const {
    envList
} = require('../../envList.js');

Page({
    data: {
        theme: 'white',
        envList,
        selectedEnv: envList[0],
        userIntegral: 0,
        userName: undefined,
        openid: undefined,
        userAvatar: undefined,
        icon_location: '/../image/theme',
        homeElement: {
            'achievement': {name: "成就"},
            'bag': {name: "奖励"},
            'whisper': {name: "悄悄话"},
            'game': {name: "游戏"},
            'manage': {name: "管理"},
        },
    },

    onLoad(options) {
        this.setData({
            theme: options.theme || 'white',
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
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
    },
    
    onShow: function () {
        this.setData({
            userIntegral: wx.getStorageSync("integral")
        });
        // 每次打开页面时根据theme更新图标
        for (let name in this.data.homeElement) {
            this.setData({
                ['homeElement.'+name+'.icon']: [this.data.icon_location, this.data.theme, name+'_cover.svg'].join('/'),
            });
        };
    },

    jumpPage(e) {
        wx.navigateTo({
            url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
        });
    },

});