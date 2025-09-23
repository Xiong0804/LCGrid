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
    const modalTitle = ref('');
    const isEditMode = ref('');
    // 刪除事件
    const deleteItems = () => {
      const selectedItems = grid.value.getSelected(); // 取得選取的資料
      if(!selectedItems || selectedItems.length === 0){
        alert("請選取欲刪除資料");
        return;
      }
      const selectedCount = selectedItems.length;
      if(confirm(`確認刪除 ${selectedCount} 筆資料?`))
      {
        const recNos = selectedItems.map(item => item.ReceNo);
        FakeBackend.Delete(recNos);
        grid.value.query();
      }      
    }

    const exportList = () =>{
      alert('匯出');
    }
    const changeUser = () =>{
      alert('異動承辦人');
    }
    // 點新增按鈕開啟彈跳視窗
    const openModal = (doc)=>{
      modalData.value = {...doc}
      modalTitle.value = '彈跳視窗 - 新增'
      isEditMode.value = "新增"; // 新增狀態
      modalRef.value.show()
    }

    const onModalHidden = ()=>{
      modalData.value = {}
    }
    // 新增資料
    const saveItem = () => {
      // 新增時按儲存
      console.log(isEditMode.value);
      if(!modalData.value.ReceNo)
      {
        alert("請輸入公文文號");
        return
      }
      if(isEditMode.value === '新增')
      {
        const itemSN = FakeBackend.getMaxSN(); // 取得SN最大值
        FakeBackend.Create({
          SN: itemSN + 1, // 流水號
          ReceNo: modalData.value.ReceNo, // 公文文號
          CaseNo: "K000" + itemSN.toString().padStart(2, '0'), // 案號
          Content: modalData.value.Content, // 備註
          ComeDate: dayjs().add(itemSN, 'day').toDate(),
          ReceDate: dayjs().add(itemSN - 60, 'day').toDate(),
          FinalDate: dayjs().add(itemSN - 30, 'day').toDate(),
          User: modalData.value.User
        });

      }
      else if(isEditMode.value === '編輯')
      {
        FakeBackend.Update(modalData.value.SN,{
          ReceNo: modalData.value.ReceNo,
          Content: modalData.value.Content,
          User: modalData.value.User
        });
      }
      grid.value.query(); // 重新查詢       
      modalRef.value.hide(); // 關閉彈跳視窗
    }
    // 編輯事件，帶入資料
    const editItem = (SN) =>{
      console.log(SN);
      isEditMode.value = "編輯"; 
      modalTitle.value = '彈出視窗 - 編輯';
      const item = FakeBackend.Get(SN);
      if(!item){
        alert("查無資料");
        return;
      }
      modalData.value = {
        SN:item.SN,
        ReceNo:item.ReceNo,
        CaseNo:item.CaseNo,
        ComeDate:item.ComeDate,
        ReceDate:item.ReceDate,
        FinalDate:item.FinalDate,
        User:item.User,
        Content:item.Content
      };      
      modalRef.value.show();
    }
    // 檢視事件，帶入資料
    const checkItem = (SN) =>{
      isEditMode.value = "檢視"; 
      modalTitle.value = '彈出視窗 - 檢視';
      const item = FakeBackend.Get(SN);
      modalData.value = {
        SN:item.SN,
        ReceNo:item.ReceNo,
        CaseNo:item.CaseNo,
        ComeDate:item.ComeDate,
        ReceDate:item.ReceDate,
        FinalDate:item.FinalDate,
        User:item.User,
        Content:item.Content
      };      
      modalRef.value.show();
    }
    // 調整到期日的顏色
    const rowStyle = (item) => { 
      const today = dayjs().startOf('day'); // 取得今天日期(年月日)
      const finalDate = dayjs(item.FinalDate).startOf('day'); // 取得FinalDate日期(年月日)
      const diffDays = finalDate.diff(today, 'day'); // 計算finalDate和today的天數

      if(diffDays > 0 && diffDays <= 10)
      {
        return 'text-primary'; // [到期日期] 在十天內，則該筆資料[到期日期]欄位字體顏色為藍色
      }
      if (diffDays < 0) {
         return 'text-danger'; // [到期日期] 小於今天，則該筆資料[到期日期]欄位字體顏色為紅色
      }
      if(diffDays === 0)
      {
        return 'text-success'; // [到期日期] 等於今天，則該筆資料[到期日期]欄位字體顏色為綠色
      }
      return ''; 
    }
    return {
      saveItem,
      editItem,
      rowStyle,
      dayjs,
      deleteItems,
      checkItem,
      exportList,
      changeUser,
      openModal,
      onModalHidden,
      modalRef,
      modalData,
      grid,
      modalTitle,
      isEditMode,
    };
  },
});
app.mount('#app')
