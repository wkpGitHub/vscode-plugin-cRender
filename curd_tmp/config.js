import { generateFieldList, defineTableFieldConfig, defineFormFieldConfig, defineSearchFieldConfig } from '@cip/utils/config-util'

export const pageEntity = {
  name: { label: '白名单名称' },
  createTime: { label: '创建时间', type: 'date', viewType: 'datetime' }
}

export const searchFieldList = generateFieldList(defineSearchFieldConfig({
  name: {},
  beginDate: { label: '创建时间', type: 'dateRange', viewType: 'datetime', otherKey: 'endDate', span: 2 }
}), pageEntity)

export const tableColumns = generateFieldList(defineTableFieldConfig({
  name: { showOverflowTooltip: true },
  createTime: { sortable: 'custom' }
}), pageEntity)

export const formFieldList = generateFieldList(defineFormFieldConfig({
  name: { required: true }
}), pageEntity)
