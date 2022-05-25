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
        openid: undefined
    },

    onLoad() {
        this.getOpenId();
    },

    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (res) => {
                // set global info
                console.log('Start query user:' + this.data.openid);
                wx.setStorageSync('openid', this.data.openid)
                wx.setStorageSync('envId', this.data.selectedEnv.envId)
                wx.setStorageSync('user_name', res.userInfo.nickName)
                wx.setStorageSync('avatar_url', res.userInfo.avatarUrl)
                var that = this;
                var today = new Date() / 1;
                var yesterday = new Date();
                yesterday = yesterday.setDate(yesterday.getDate() - 1);
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
                    .then((db_res) => {
                        // db_res.result.data 是包含以上定义的两条记录的数组
                        if (db_res.result.data.length == 0) {
                            console.log('Start adding records');
                            wx.cloud.callFunction({
                                    name: 'quickstartFunctions',
                                    config: {
                                        env: that.data.selectedEnv.envId
                                    },
                                    data: {
                                        type: 'addUser',
                                        data: {
                                            openid: that.data.openid,
                                            avatar_url: res.userInfo.avatarUrl,
                                            user_name: res.userInfo.nickName,
                                            user_gender: res.userInfo.gender,
                                            today: today,
                                            yesterday: yesterday
                                        }
                                    }
                                })
                                .then((add_res) => {
                                    console.log('Add a new record.');
                                    wx.setStorageSync('_id', add_res.result._id);
                                    wx.setStorageSync('integral', 0);
                                    wx.setStorageSync('whisper_text', '');
                                    app.globalData.theme = 'white';
                                    wx.switchTab({
                                        url: `../main/index`,
                                    });
                                })
                        } else {
                            let db_user = db_res.result.data[0];
                            wx.setStorageSync('_id', db_user._id)
                            wx.setStorageSync('integral', db_user.user_integral);
                            wx.setStorageSync('whisper_text', db_user.message);
                            app.globalData.theme = db_user.theme;
                            if (
                                db_user.user_name !== res.userInfo.nickName ||
                                db_user.avatar_url !== res.userInfo.avatarUrl ||
                                db_user.user_gender !== res.userInfo.gender
                            ) {
                                console.log('Start updating records');
                                wx.setStorageSync('user_name', res.userInfo.nickName);
                                const db = wx.cloud.database();
                                const user = db.collection('user');
                                user.doc(db_user._id).update({
                                    data: {
                                        user_name: res.userInfo.nickName,
                                        avatar_url: res.userInfo.avatarUrl,
                                        user_gender: res.userInfo.gender
                                    },
                                    success: function (res) {
                                        console.log('Update personal data successfully.');
                                        that.setData({
                                            userName: res.userInfo.nickName
                                        });
                                        console.log('Update a record.');
                                        wx.switchTab({
                                            url: `../main/index`,
                                        });
                                    },
                                    fail: function (res) {
                                        console.log('Fail to update personal data.');
                                        console.log(res);
                                    }
                                });
                            } else {
                                console.log('No need to update personal info in DB.');
                                wx.switchTab({
                                    url: `../main/index`,
                                });
                            }
                        }
                    })
                    .catch((e) => {
                        console.log('Fail to query user information from database "user". Create a new record. ', e);
                        wx.cloud.callFunction({
                                name: 'quickstartFunctions',
                                config: {
                                    env: that.data.selectedEnv.envId
                                },
                                data: {
                                    type: 'addUser',
                                    data: {
                                        openid: that.data.openid,
                                        avatar_url: res.userInfo.avatarUrl,
                                        user_name: res.userInfo.nickName,
                                        user_gender: res.userInfo.gender,
                                        today: today,
                                        yesterday: yesterday
                                    }
                                }
                            })
                            .then((add_res) => {
                                console.log('Add a new record.');
                                wx.setStorageSync('_id', add_res.result._id);
                                wx.setStorageSync('integral', 0);
                                wx.setStorageSync('whisper_text', '');
                                app.globalData.theme = 'white';
                                wx.switchTab({
                                    url: `../main/index`,
                                });
                            })
                    })
            },
            fail: (res) => {
                console.log(res);
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

            }).catch((e) => {
                console.log(e);
            });
    },
    onShow: function () {},

    jumpPage(e) {
        wx.navigateTo({
            url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
        });
    },

});