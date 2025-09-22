import './styles.scss';
import {LcGridVue, LcColumn} from './components/LcGridVue/LcGridVue.js';
import LcModal from './components/LcModal/LcModal.js';
import LcDatepicker from './components/LcDatepicker/LcDatepicker.js';
import FakeBackend from './FakeBackend/FakeBackend.js';

const {
  createApp,
  ref,
  onMounted,
  watch
} = Vue;

const app = createApp({
  components: {
    LcGridVue,
    LcColumn,
    LcModal,
    LcDatepicker
  },
  setup() {
    const grid = ref(null);
    const modalData  = ref({})
    const modalRef = ref(null)

    const deleteItems = () => {
      const selectedItem = grid.value.getSelected().map(_ => _.ReceNo)
      const messageReceNos = selectedItem.join('、');
      alert('刪除文號:' + messageReceNos);
    }

    const exportList = () =>{
      alert('匯出');
    }
    const changeUser = () =>{
      alert('異動承辦人');
    }
    const openModal = (doc)=>{
      modalData.value = {...doc}
      modalRef.value.show()
    }

    const onModalHidden = ()=>{
      modalData.value = {}
    }

    const saveItem = () => {
      if(!modalData.value.ReceNo)
      {
        alert("請輸入公文文號");
      }else
      {
        FakeBackend.Create({
          SN: Date.now(),
          ReceNo: modalData.value.ReceNo,
          CaseNo: "K00000",
          Content: modalData.value.Content,
          ComeDate: dayjs().add(1, 'day').toDate(),
          ReceDate: dayjs().add(1 - 60, 'day').toDate(),
          FinalDate: dayjs().add(1 - 30, 'day').toDate(),
          User: modalData.value.User
  
        });
        grid.value.query();
        modalRef.value.hide();
      }
    }
    const editItem = (SN) =>{
      console.log(SN);
      const item = FakeBackend.Get(SN);
      console.log(item);
      if(!item){
        alert("查無資料");
        return;
      }
      modalData.value = {
        ReceNo:item.ReceNo,
        CaseNo:item.CaseNo,
        ComeDate:item.ComeDate,
        ReceDate:item.ReceDate,
        FinalDate:item.FinalDate,
        User:item.User,
        Content:item.Content
      };
      modalRef.value.show();
    };
    return {
      saveItem,
      editItem,
      deleteItems,
      exportList,
      changeUser,
      openModal,
      onModalHidden,
      
      modalRef,
      modalData,
      grid,
    };
  },
});
app.mount('#app')
