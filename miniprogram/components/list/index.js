// components/list/index.js
const {
    envList
} = require('../../envList.js');

Component({
    options: {
        styleIsolation: 'shared'
    },
    /**
     * 组件的属性列表
     */
    properties: {
        types: {
            type: Array,
            value: ['regular']
        },
        records: {
            type: Array,
            value: []
        },
        titles: {
            type: Array,
            value: [
                {regular: '名称'},
                '内容'
            ]
        },
        name_width: {
            type: String,
            value: '50%'
        },
        content_width: {
            type: String,
            value: '50%'
        },
        is_manager: {
            type: Boolean,
            value: false
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        selectedEnv: envList[0],
        slideButtons: [{
            extClass: 'send-icon',
            src: '/image/icon/send.svg'
          }, {
            extClass: 'more-icon',
            src: '/image/icon/more.svg'
          }, {
            extClass: 'done-icon',
            src: '/image/icon/done.svg'
          }, {
            extClass: 'more-icon',
            src: '/image/icon/more.svg'
          }, {
            extClass: 'update-icon',
            src: '/image/icon/update.svg'
          }, {
            extClass: 'delete-icon',
            src: '/image/icon/delete.svg'
          }]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        slideButtonTap(e) {
            if (e.detail.index == 0) {
                for (var idx in this.data.records) {
                    if (this.data.records[idx]._id == e.currentTarget.dataset.id && this.data.records[idx].is_finished) {
                        return
                    }
                }
                this.triggerEvent('submitFunc', {
                    item_content: e.currentTarget.dataset.content,
                    item_type: e.currentTarget.dataset.type,
                    item_id: e.currentTarget.dataset.id,
                    item_name: e.currentTarget.dataset.name,
                    item_time: e.currentTarget.dataset.time
                });
            } else if (e.detail.index == 1) {
                this.setData({
                    showIntro: true,
                    msg: e.currentTarget.dataset.content
                });
            }
        }
    }
})