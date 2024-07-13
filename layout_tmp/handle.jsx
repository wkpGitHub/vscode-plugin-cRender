import { reactive, ref } from 'vue'
import CipPageLayoutHandle from '@cip/page-layout/handle'
import CipButton from '@cip/components/cip-button'
import { xxServer } from '@/api'
import { useMain } from '@cip/hooks/use-main'

export default {
  props: {
    id: {
      type: [String, Number]
    }
  },
  setup (props) {
    const { closeTab } = useMain()

    // 保存
    function save () {

    }


    return () => <CipPageLayoutHandle>{{
      default: () => <div>
        
      </div>,
      handler: ({loading}) => <>
        <CipButton onClick={closeTab}>取消</CipButton>
        <CipButton type="primary" loading={loading} onClick={save}>保存</CipButton>
      </>
    }}</CipPageLayoutHandle>
  }
}
