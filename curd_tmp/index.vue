<script lang="jsx">
import {msgBusinessParam} from '@/request'
import { defineFormConfig, defineSearchConfig, defineTableConfig } from '@common/hooks'
import store from '@/store'

export default {
  setup() {
    const {state: storeState} = store

    const tableConfig = defineTableConfig({
      rowName: 'name',
      columns: [
        { type: 'index', label: '序号', fixed: 'left', width: 50 },
        { label: '名称', prop: 'name' },
        { label: '类型', type: 'select', prop: 'msgType', options: () => storeState.selectOptMap.msg_auth_msg_type },
        { label: '状态', type: 'status', prop: 'enabled', options: enabledOpts, width: 60 },
        { label: '备注', prop: 'memo', minWidth: 200, showOverflowTooltip: true},
        { label: '创建人', prop: 'creator'},
        { label: '创建时间', prop: 'gmtCreate', width: 160 },
        { label: '修改人', prop: 'modifier', hidden: true },
        { label: '修改时间', prop: 'gmtModified', width: 160, hidden: true },
      ],
      handlerSlot({row, editRow, deleteRow}) {
        return <>
          <el-button link type="primary" onClick={() => showEdit(editRow, row)}>编辑</el-button>
          <el-button link type="danger" onClick={() => deleteRow({row})}>删除</el-button>
        </>
      }
    })

    const searchConfigList = defineSearchConfig({
      configList: [
        { type: 'radio', isButton: true, defaultValue: '', prop: 'enabled', options: [{label: '全部', value: ''}, ...enabledOpts] },
        { label: '名称', prop: 'name', width: 200 },
      ]
    })

    const formConfig = defineFormConfig({
      configList: [
        { label: '名称', prop: 'name', required: true },
        { label: '类型', type: 'select', prop: 'msgType', options: () => storeState.selectOptMap.msg_auth_msg_type },
        { label: '状态', type: 'radio', defaultValue: true, prop: 'enabled', required: true, options: enabledOpts },
        { label: '备注', prop: 'memo', inputType: 'textarea', rows: 4 },
      ],
      labelWidth: 90
    })

    return () => <PageList 
      tableConfig={tableConfig} 
      searchConfig={{ configList: searchConfigList }} 
      formConfig={formConfig}
      dialogConfig={{width: 500}}
      api={msgBusinessParam}>
    </PageList>
  }
}
</script>