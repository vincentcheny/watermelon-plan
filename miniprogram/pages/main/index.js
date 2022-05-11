const {
    envList
} = require('../../envList.js');

Page({
    data: {
        theme: 'light',
        envList,
        selectedEnv: envList[0],
        userIntegral: 0,
        userName: undefined,
        openid: undefined,
        userAvatar: undefined,
        homeElement: [
            {name: "成就", pic: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/white/white_achievement_cover.svg'},
            {name: "礼品", pic: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/white/white_bag_cover.svg'},
            {name: "悄悄话", pic: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/white/white_whisper_cover.svg'},
            {name: "游戏", pic: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/white/white_game_cover.svg'},
            {name: "管理", pic: 'cloud://cloud1-3gno89qrd4ac7e40.636c-cloud1-3gno89qrd4ac7e40-1310793785/white/white_game_cover.svg'},
        ],
        dest: {
            "成就": "main/achievement",
            "礼品": "main/bag",
            "悄悄话": "main/whisper",
            "游戏": "main/game",
            "管理": "main/manage"
        }
    },

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
        this.setData({
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
            // userAvatar: undefined
        })
    },
    
    onShow: function () {
        this.setData({
            userIntegral: wx.getStorageSync("integral")
        })
    },

    jumpPage(e) {
        console.log("jump to "+e.currentTarget.dataset.page);
        wx.navigateTo({
            url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
        });
    },

});