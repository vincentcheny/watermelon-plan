// pages/main/manage/index.js

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
        collectionNames: ['mission', 'reward'],
        cp_message: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
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
        this.getManageList();
        this.getCouple();
    },

    getManageList() {
        wx.showLoading({
            title: '读取编辑列表',
        });
        this.setData({
            openid: wx.getStorageSync("openid")
        })
        var that = this;
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
                for (let collectionName of that.data.collectionNames) {
                    let collectionName_copy = collectionName;
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
                            var record = res.result.data;
                            for (var i in record) {
                                record[i].attr = collectionName;
                                record[i].editName = false;
                                record[i].editScore = false;
                            };
                            record.sort((a, b) => {
                                if (a.name !== b.name) {
                                    return a.name < b.name;
                                } else {
                                    return a._id < b._id;
                                }
                            });
                            if (that.data.record == undefined) {
                                that.setData({
                                    type: ['daily', 'weekly', 'xothers'],
                                    record: record,
                                    attribute: new Array(collectionName_copy)
                                });
                            } else {
                                that.setData({
                                    record: record.concat(that.data.record),
                                    attribute: new Array(collectionName_copy).concat(that.data.attribute).sort()
                                });
                            }
                            wx.hideLoading();
                        }).catch((e) => {
                            console.log(e);
                        });
                }
            }).catch((e) => {
                console.log(e);
            });
    },

    getCouple() {
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        var that = this;
        db.collection('secret').limit(1).get().then((res) => {
            db.collection('user')
                .where({
                    _openid: res.data[0].cp_openid
                })
                .get({
                    success: function (res_db) {
                        let msg = [];
                        msg.push('昵称：' + JSON.stringify(res_db.data[0]['user_name']))
                        msg.push('积分：' + res_db.data[0]['user_integral'])
                        msg.push('悄悄话：' + res_db.data[0]['message'])
                        if (res_db.data[0]['todo'].length > 0) {
                            for (let i = 0; i < res_db.data[0]['todo'].length; i++) {
                                msg.push('TODO_' + i + '：' + res_db.data[0]['todo'][i].content)
                            }
                        }
                        db.collection('bag')
                            .where({
                                _openid: res.data[0].cp_openid
                            })
                            .get({
                                success: function (res_bag) {
                                    if (res_bag.data.length > 0) {
                                        for (let i = 0; i < res_bag.data.length; i++) {
                                            msg.push('Bag_' + i + '：' + res_bag.data[i].reward_name)
                                        }
                                    }
                                    that.setData({
                                        cp_message: msg
                                    })
                                }
                            })
                    },
                    fail: function (res_db) {
                        console.log(res_db);
                    }
                })
        })
    },

    enableEdit(e) {
        for (var i in this.data.record) {
            if (this.data.record[i]._id == e.currentTarget.dataset.id) {
                this.setData({
                    ['record[' + i + '].edit' + e.currentTarget.dataset.type]: true
                });
            }
        }
    },

    bindBlur: function (e) {
        for (var i in this.data.record) {
            if (this.data.record[i]._id == e.currentTarget.dataset.id) {
                this.setData({
                    ['record[' + i + '].name']: e.detail.value
                });
            }
        }
    },

    submit(e) {
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            config: {
                env: this.data.selectedEnv.envId
            },
            data: {
                type: 'updateCollection',
                data: {
                    id: e.currentTarget.dataset.id,
                    collection_name: e.currentTarget.dataset.attr,
                    update_objects: {
                        name: {
                            type: 'set',
                            value: e.detail.value.name ?? e.currentTarget.dataset.name
                        },
                        score: {
                            type: 'set',
                            value: e.detail.value.score ?? e.currentTarget.dataset.score
                        }
                    }
                }
            }
        }).then((resp) => {
            wx.showModal({
                title: '提示',
                content: '更新成功！',
                showCancel: false
            });
        }).catch((e) => {
            console.error(e);
        });
    },

    add(e) {
        if (!e.detail.value.name || !e.detail.value.score) {
            wx.showModal({
                title: '提示',
                content: '数据未填写完整',
                showCancel: false,
            })
            return;
        }
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        db.collection(e.currentTarget.dataset.attr)
            .add({
                data: {
                    name: e.detail.value.name,
                    score: e.detail.value.score,
                    type: e.currentTarget.dataset.type
                },
                success: (res) => {
                    wx.showModal({
                        title: '提示',
                        content: '数据添加成功',
                        showCancel: false,
                        success: (res) => {
                            wx.redirectTo({
                                url: `/pages/main/manage/index`
                            });
                        },
                        fail: (res) => {
                            console.log(res);
                        }
                    });
                },
                fail: (res) => {
                    wx.showModal({
                        title: '提示',
                        content: res,
                        showCancel: false
                    })
                }
            });
    },

    delete(e) {
        const db = wx.cloud.database({
            env: this.data.selectedEnv.envId
        })
        db.collection(e.currentTarget.dataset.attr)
            .doc(e.currentTarget.dataset.id)
            .remove({
                success: function (res) {
                    let title;
                    let content;
                    if (res.stats.removed == 1) {
                        title = '提示';
                        content = '删除成功';
                    } else {
                        title = '无记录或异常';
                        content = JSON.stringify(res);
                    }
                    wx.showModal({
                        title: title,
                        content: content,
                        showCancel: false,
                        success: () => {
                            wx.redirectTo({
                                url: `/pages/main/manage/index`
                            });
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
            userIntegral: wx.getStorageSync("integral"),
            openid: wx.getStorageSync("openid"),
            userName: wx.getStorageSync("user_name"),
            // userAvatar: undefined
        })
    },

})