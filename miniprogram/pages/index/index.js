const {
    envList
} = require('../../envList.js');
const app = getApp();

Page({
    data: {
        envList,
        selectedEnv: envList[0],
        haveCreateCollection: false,
        userIntegral: 0,
        userName: undefined,
        openid: undefined,
        userAvatar: undefined
    },

    onLoad() {
        this.getOpenId();
    },

    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (res) => {
                // set global info
                wx.setStorageSync('openid', this.data.openid)
                wx.setStorageSync('envId', this.data.selectedEnv.envId)
                wx.setStorageSync('user_name', res.userInfo.nickName)
                wx.setStorageSync('avatar_url', res.userInfo.avatarUrl)
                const db = wx.cloud.database();
                const user = db.collection('user');
                console.log('Start query user:' + this.data.openid);
                var query_openid = this.data.openid
                var that = this;
                var curtime = new Date()/1;
                user.where({
                        _openid: query_openid
                    })
                    .get({
                        success: function (db_res) {
                            // db_res.data 是包含以上定义的两条记录的数组
                            if (db_res.data.length == 0) {
                                console.log('Start adding records');
                                user.add({
                                    data: {
                                        avatar_url: res.userInfo.avatarUrl,
                                        user_integral: 0,
                                        user_name: res.userInfo.nickName,
                                        user_gender: res.userInfo.gender,
                                        daily_mission: {},
                                        weekly_mission: {},
                                        daily_reward: {},
                                        weekly_reward: {},
                                        update_time: curtime,
                                        message: '',
                                        gamble_combo: 0,
                                        gamble_limit: 8,
                                        achievement_data: {
                                            num_game: 0,
                                            num_200_game: 0,
                                            num_1000_game: 0,
                                            last_mission: curtime,
                                            cur_mission_combo: 0,
                                            total_integral: 0,
                                            max_mission_combo: 0
                                        },
                                        achievement: [],
                                        theme: 'white'
                                    }
                                })
                                console.log('Add a new record.');
                            } else if (
                                db_res.data[0].user_name !== res.userInfo.nickName ||
                                db_res.data[0].avatar_url !== res.userInfo.avatarUrl ||
                                db_res.data[0].user_gender !== res.userInfo.gender
                            ) {
                                console.log('Start updating records');
                                user.doc(db_res.data[0]._id).update({
                                    data: {
                                        user_name: res.userInfo.nickName,
                                        avatar_url: res.userInfo.avatarUrl,
                                        user_gender: res.userInfo.gender
                                    },
                                    success: function (res) {
                                        console.log('Update personal data successfully.');
                                        this.setData({
                                            userName: res.userInfo.nickName
                                        });
                                        console.log('Update a record.');
                                    },
                                    fail: function (res) {
                                        console.log('Fail to update personal data.');
                                        console.log(res);
                                    }
                                })
                            } else {
                                console.log('No need to update personal info in DB.');
                            }
                            that.refreshUser();
                        },
                        fail: function (db_res) {
                            console.log('Fail to query user information from database "user". Create a new record.');
                            const db = wx.cloud.database();
                            const user = db.collection('user');
                            user.add({
                                data: {
                                    avatar_url: res.userInfo.avatarUrl,
                                    user_integral: 0,
                                    user_name: res.userInfo.nickName,
                                    user_gender: res.userInfo.gender,
                                    daily_mission: {},
                                    weekly_mission: {},
                                    daily_reward: {},
                                    weekly_reward: {},
                                    update_time: curtime,
                                    message: '',
                                    gamble_combo: 0,
                                    gamble_limit: 8,
                                    achievement_data: {
                                        num_game: 0,
                                        num_200_game: 0,
                                        num_1000_game: 0,
                                        last_mission: curtime,
                                        cur_mission_combo: 0,
                                        total_integral: 0,
                                        max_mission_combo: 0
                                    },
                                    achievement: [],
                                    theme: 'white'
                                }
                            });
                            console.log('finish adding user info');
                            
                            wx.switchTab({
                                url: `../main/index`,
                            });
                        }
                    })
            },
            fail: (res) => {
                console.log(res);
                console.log('用户点击拒绝')
                wx.showModal({
                    cancelColor: 'cancelColor',
                    title: '不授权的话就用不了',
                    content: '还是授权一下呗',
                    success: (res) => {
                        this.getUserProfile();
                    },
                    confirmText: '也是授权',
                    cancelText: '授权'
                })
            }
        });
    },

    getOpenId() {
        if (this.data.openid !== undefined && this.data.userName !== undefined) {
            console.log('No need to get openid. this.data.openid:' + this.data.openid);
            wx.navigateTo({
                url: `/pages/main/index?envId=${this.data.selectedEnv.envId}`,
            });
        } else if (this.data.openid !== undefined) {
            // this.getUserProfile();
            wx.navigateTo({
                url: `/pages/main/index?envId=${this.data.selectedEnv.envId}`,
            });
        } else {
            wx.cloud.init({
                env: this.data.selectedEnv.envId
            })
            wx.showLoading({
                title: '读取账户信息',
            });
            wx.cloud.callFunction({
                name: 'quickstartFunctions',
                config: {
                    env: this.data.selectedEnv.envId
                },
                data: {
                    type: 'getOpenId'
                }
            }).then((resp) => {
                this.setData({
                    openid: resp.result.openid
                });
                wx.hideLoading();
            }).catch((e) => {
                console.log(e);
                wx.hideLoading();
            });
        }
    },

    refreshUser() {
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
                wx.setStorageSync('user_name', resp.result.data[0].user_name);
                wx.setStorageSync('integral', resp.result.data[0].user_integral);
                app.globalData.theme = resp.result.data[0].theme;
                wx.switchTab({
                    url: `../main/index`,
                });
            }).catch((e) => {
                console.log(e);
            });
    },
    onShow: function () {
    },
    
    jumpPage(e) {
        wx.navigateTo({
            url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
        });
    },

});