<script lang="jsx">
import { vendorService, vendorConfigItemService } from '@/request'
import { defineFormConfig, defineSearchConfig, defineTableConfig } from '@common/hooks'
import { reactive } from 'vue';
import store from '@/store'
import {enabledOpts} from '@/utils/constants'
// import SetTemplate from './setTemplate'

export default {
  setup() {
    const { state: storeState } = store
    /* ---------------------------------- 左边 --------------------------------------*/
    const state = reactive({
      vendorId: '',
    })

    function leftChangeData({tableState}) {
      const checkRow = tableState.data.find(item => state.vendorId === item.id)
      // 如果当前数据保护选中的数据
      if (checkRow) {
        checkRow._checked = true
      }  else {
        // 如果不包含，就要重置右边所有列
        state.vendorId = ''
        middleState.apiVersionId = ''
      }
    }

    const tableConfig = defineTableConfig({
      rowName: 'name',
      columns: [
        { label: '名称', prop: 'name' },
        { label: '编码', prop: 'code' },
        { label: '类型', type: 'select', prop: 'types', multiple: true, options: () => storeState.selectOptMap.vendor_type, fieldFormat(value) {
          return value?.join(', ')
        }},
      ],
      onClickRow({ row, data }) {
        if (row._checked) return
        data.forEach(item => item._checked = (row.id === item.id))
        state.vendorId = row.id
        middleState.apiVersionId = ''
      }
    })

    const formConfig = defineFormConfig({
      configList: [
        { label: '服务商名称', prop: 'name', required: true },
        { label: '编码', prop: 'code', required: true, type: 'select', options: () => storeState.selectOptMap.vendor },
        { label: '类型', type: 'select', prop: 'types', defaultValue: [], required: true, multiple: true, options: () => storeState.selectOptMap.vendor_type },
        { label: '备注', prop: 'memo', inputType: 'textarea', rows: 4 },
      ],
      labelWidth: 90
    })

    /* ---------------------------------- 中间 --------------------------------------*/
    const middleState = reactive({
      apiVersionId: ''
    })

    function middleChangeData({tableState}) {
      const checkRow = tableState.data.find(item => middleState.groupId === item.id)
      // 如果当前数据保护选中的数据
      if (checkRow) {
        checkRow._checked = true
      }  else {
        // 如果不包含，就要重置右边所有列
        middleState.apiVersionId = ''
      }
    }

    const middleTableConfig = defineTableConfig({
      rowName: 'name',
      columns: [
        { label: '名称', prop: 'name' },
      ],
      onClickRow({ row, data }) {
        if (row._checked) return
        data.forEach(item => item._checked = (row.id === item.id))
        middleState.apiVersionId = row.id
      }
    })

    const middleFormConfig = defineFormConfig({
      configList: [
        { label: 'API名称', prop: 'name', required: true },
        { label: 'API版本', prop: 'apiVersion', required: true, type: 'select', options: () => storeState.selectOptMap.vendor_api_version },
        { label: '类型', prop: 'types', type: 'select', multiple: true, options: () => storeState.selectOptMap.vendor_api_version_type },
        { label: '有效时间', prop: ['effectiveBegin', 'effectiveEnd'], type: 'date', dateType: 'datetimerange', },
        { label: '二字码集合', placeholder: '请输入收件人国家二字码集合，一行一个', prop: 'consigneeCountryCodes', inputType: 'textarea', rows: 4 },
        { label: '备注', prop: 'memo', inputType: 'textarea', rows: 4 },
      ],
      labelWidth: 90
    })

    /* ---------------------------------- 右边 --------------------------------------*/
    const rightState = reactive({
      isShowTmp: false,
      currentItem: {}
    })

    function showTmp(row) {
      rightState.isShowTmp = true
      rightState.currentItem = row
    }

    const rightTableConfig = defineTableConfig({
      rowName: 'name',
      columns: [
        { type: 'index', label: '序号', fixed: 'left', width: 42 },
        { label: '名称', prop: 'name' },
        { label: '创建人', prop: 'creator'},
        { label: '创建时间', prop: 'gmtCreate', width: 160 },
      ],
      handlerWidth: 150,
      handlerSlot({row, editRow, deleteRow}) {
        return <>
          <ElButton link type="primary" onClick={() => showTmp(row)}>设置模板</ElButton>
          <ElButton link type="primary" onClick={() => editRow({ row })}>编辑</ElButton>
          <ElButton link type="danger" onClick={() => deleteRow({ row })}>删除</ElButton>
        </>
      }
    })

    const rightFormConfig = defineFormConfig({
      configList: [
        { label: '名称', prop: 'name', required: true },
        { label: '状态', prop: 'enabled', required: true, type: 'radio', defaultValue: true, options: enabledOpts },
        { label: '备注', prop: 'memo', inputType: 'textarea', rows: 4 },
      ],
      labelWidth: 80
    })

    return () => <div class="simple__list-wrap">
      <PageList
        style="width: 400px"
        simple
        pageName=""
        tableConfig={tableConfig}
        searchConfig={{ configList: [{ label: '名称', prop: 'name', width: 120, simple: true }] }}
        dialogConfig={{ width: 400 }}
        formConfig={formConfig}
        onChangeData={leftChangeData}
        api={vendorService}>
      </PageList>
      <PageList
        key={state.vendorId}
        simple
        pageName=""
        style="width: 400px"
        extraParams={state}
        initSearch={!!state.vendorId}
        operateConfig={{disabledAdd: !state.vendorId}}
        tableConfig={middleTableConfig}
        searchConfig={{ configList: [{ label: '名称', prop: 'name', width: 120, simple: true }] }}
        dialogConfig={{ width: 400 }}
        formConfig={middleFormConfig}
        onChangeData={middleChangeData}
        api={vendorConfigItemService}>
      </PageList>
      <PageList
        key={middleState.apiVersionId}
        simple
        pageName=""
        style="min-width: 400px"
        class="flex--auto-hidden"
        extraParams={middleState}
        initSearch={!!middleState.apiVersionId}
        operateConfig={{disabledAdd: !middleState.apiVersionId}}
        tableConfig={rightTableConfig}
        searchConfig={{ configList: [
          { type: 'radio', isButton: true, defaultValue: '', prop: 'enabled', options: [{label: '全部', value: ''} , ...enabledOpts] },
          { label: '名称', prop: 'name', width: 120, simple: true }
        ]}}
        dialogConfig={{ width: 400 }}
        formConfig={rightFormConfig}
        api={vendorConfigItemService}>
      </PageList>
      {/* <SetTemplate v-model={rightState.isShowTmp} currentItem={rightState.currentItem} /> */}
    </div>
  }
}
</script>