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
            value: []
        },
        records: {
            type: Array,
            value: []
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        selectedEnv: envList[0],
        slideButtons: [{
            text: '普通',
            extClass: 'send-icon',
            src: '/image/icon/send.svg'
          },{
            text: '普通',
            extClass: 'done-icon',
            src: '/image/icon/done.svg'
          }]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        slideButtonShow(e) {
            for (var idx in this.data.records) {
                if (this.data.records[idx]._id == e.currentTarget.dataset.id && this.data.records[idx].is_finished) {
                    return
                }
            }
            this.triggerEvent('submitFunc', {
                item_content: e.currentTarget.dataset.content,
                item_type: e.currentTarget.dataset.type,
                item_id: e.currentTarget.dataset.id,
                item_name: e.currentTarget.dataset.name
            });
        }
    }
})