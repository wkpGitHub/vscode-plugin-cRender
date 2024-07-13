import CipPageLayoutLeftRight from '@cip/page-layout/left-right'

export default {
  setup () {
    
    return () => <CipPageLayoutLeftRight leftStyle={{ width: '400px' }}>
      {{
        left: () => <div></div>,
        default: () => <div></div>
      }}
    </CipPageLayoutLeftRight>
  }
}