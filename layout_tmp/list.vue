<script lang="jsx">
import {msgBusinessParam} from '@/request'
import { defineFormConfig, defineSearchConfig, defineTableConfig } from '@common/hooks'
import {enabledOpts} from '@/utils/constants'
import store from '@/store'

export default {
  setup() {
    const {state: storeState} = store

    const tableConfig = defineTableConfig({
      rowName: 'name',
      columns: [
        { type: 'index' },
        { label: '名称', prop: 'name' },
        { label: '类型', prop: 'msgType', type: 'select', options: () => storeState.selectOptMap.msg_auth_msg_type },
        { label: '状态', prop: 'enabled', type: 'status', options: enabledOpts, width: 60 },
        { label: '备注', prop: 'memo', minWidth: 200, showOverflowTooltip: true},
        { label: '创建人', prop: 'creator'},
        { label: '创建时间', prop: 'gmtCreate', width: 160 },
        { label: '修改人', prop: 'modifier', hidden: true },
        { label: '修改时间', prop: 'gmtModified', width: 160, hidden: true },
      ],
      handlerSlot({row, editRow, deleteRow}) {
        return <>
          <el-button link type="primary" onClick={() => editRow({row})}>编辑</el-button>
          <el-button link type="danger" onClick={() => deleteRow({row})}>删除</el-button>
        </>
      }
    })

    const searchConfig = defineSearchConfig({
      configList: [
        { type: 'radio', isButton: true, defaultValue: '', prop: 'enabled', options: [{label: '全部', value: ''}, ...enabledOpts] },
        { label: '名称', prop: 'name', width: 200 },
      ]
    })

    const formConfig = defineFormConfig({
      configList: [
        { label: '名称', prop: 'name', required: true },
        { label: '类型', prop: 'type', type: 'select', options: () => storeState.selectOptMap.msg_auth_msg_type },
        { label: '状态', prop: 'enabled', type: 'radio', defaultValue: true, required: true, options: enabledOpts },
        { label: '备注', prop: 'memo', inputType: 'textarea', rows: 4 },
      ],
      labelWidth: 90
    })

    return () => <PageList 
      tableConfig={tableConfig} 
      searchConfig={searchConfig} 
      formConfig={formConfig}
      dialogConfig={{width: 500}}
      api={msgBusinessParam}>
    </PageList>
  }
}
</script>