import CipDialog from '@cip/components/cip-dialog'
import { defineComponent } from 'vue'
import CipButton from '@cip/components/cip-button'

export default defineComponent({
  setup (props, { emit }) {

    function close () {
      emit('close', false)
    }

    function save () {
      emit('save', {})
      close()
    }

    return () => <CipDialog model-value={true} dialogType={'dialog'} width="1200px" on-cancel={close} title="选择标签">{{
      default: () => <div>
        
      </div>,
      footer: () => <>
        <CipButton type="primary" onClick={save}>确认</CipButton>
        <CipButton onClick={close}>取消</CipButton>
      </>
    }}</CipDialog>
  }
})