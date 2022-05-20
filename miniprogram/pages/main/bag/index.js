// pages/bag/index.js
const {
    envList
} = require('../../../envList.js');
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        theme: 'white',
        selectedEnv: envList[0],
        records: [],
        titles: [],
        type: [],
        icon_type: 'light'
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
        this.setData({
            theme: app.globalData.theme
        });
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    icon_type: res.theme == 'dark' ? 'dark' : 'light'
                });
            }
        });
        this.refreshBag();
    },

    refreshBag() {
        wx.showLoading({
            title: '读取背包列表',
        });
        this.setData({
            openid: wx.getStorageSync("openid"),
            userIntegral: wx.getStorageSync("integral")
        })
        wx.cloud.callFunction({
                name: 'quickstartFunctions',
                config: {
                    env: this.data.selectedEnv.envId
                },
                data: {
                    type: 'getBag',
                    data: {
                        openid: wx.getStorageSync("openid")
                    }
                }
            })
            .then((resp) => {
                var records = new Array();
                for (var reward of resp.result.list[0].records) {
                    records.push({
                        _id: reward._id,
                        name: reward.reward_name,
                        exacttime: reward.time,
                        is_finished: false,
                        type: 'regular',
                        content: this.dateFormat("YYYY-mm-dd HH:MM:SS", new Date(reward.time))
                    })
                };
                records.sort((a, b) => {
                    return a.exacttime - b.exacttime
                });
                this.setData({
                    type: ['regular'],
                    records: records,
                    titles: [{
                            regular: '奖励名称'
                        },
                        '兑换时间'
                    ]
                });
                wx.hideLoading();
            }).catch((e) => {
                console.log(e);
                wx.hideLoading();
            });
    },

    submit(e) {
        wx.showModal({
            cancelColor: 'cancelColor',
            title: '是否确定使用 "' + e.detail.item_name + '" ？',
            content: '嚯嚯！',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '使用了一项奖励',
                    });
                    const db = wx.cloud.database({
                        env: this.data.selectedEnv.envId
                    })
                    db.collection('bag').where({
                        _openid: wx.getStorageSync("openid"),
                        time: e.detail.item_time
                    }).remove();

                    var new_records = new Array();
                    for (var i = 0; i < this.data.records.length; i++) {
                        if (this.data.records[i].exacttime != e.detail.item_time) {
                            new_records.push(this.data.records[i])
                        }
                    }
                    this.setData({
                        records: new_records
                    });
                    wx.hideLoading();
                }
            },
            confirmText: '确定',
            cancelText: '取消'
        })
    },

    dateFormat(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(), // 年
            "m+": (date.getMonth() + 1).toString(), // 月
            "d+": date.getDate().toString(), // 日
            "H+": date.getHours().toString(), // 时
            "M+": date.getMinutes().toString(), // 分
            "S+": date.getSeconds().toString() // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
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