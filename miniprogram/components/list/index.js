// components/list/index.js
const {
    envList
} = require('../../envList.js');

Component({
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
        },
        doneText: {
            type: String,
            value: '已做'
        },
        undoneText: {
            type: String,
            value: '未做'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        selectedEnv: envList[0],
        slideButtons: [{
            text: '普通',
            src: '/image/icon/icon_love.svg'
          }, {
            text: '普通',
            extClass: 'test',
            src: '/image/icon/icon_star.svg'
          }, {
            type: 'warn',
            text: '警示',
            extClass: 'test',
            src: '/image/icon/icon_del.svg'
          }]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        componentSubmit(e) {
            this.triggerEvent('submitFunc', {
                item_score: e.currentTarget.dataset.score,
                item_type: e.currentTarget.dataset.type,
                item_id: e.currentTarget.dataset.id,
                item_name: e.currentTarget.dataset.name
            });
        }
    }
})