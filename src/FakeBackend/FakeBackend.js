const database = [];
for (let i = 0; i < 100; i++)
    database.push({
        SN: i + 1,
        ReceNo: `11201010000${i.toString().padStart(2, '0')}`,
        CaseNo: `K000${i.toString().padStart(2, '0')}`,
        ComeDate: dayjs().add(i, 'day').toDate(),
        ReceDate: dayjs().add(i - 60, 'day').toDate(),
        FinalDate: dayjs().add(i - 30, 'day').toDate(),
        User: `使用者${i}`,
      });
    

const allField = Object.getOwnPropertyNames(database[0])

/**
 * 分頁並排序資料
 * @param {Object} params - 分頁和排序參數
 * @param {number} params.pageSize - 每頁顯示的資料數量
 * @param {number} params.nowPage - 當前頁碼
 * @param {string} params.sortAction - 排序方式 (ASC 或 DESC)
 * @param {string} params.sortField - 排序欄位
 * @returns {Object} 分頁結果
 * @returns {Array} result.rows - 當前頁的資料
 * @returns {number} result.total - 資料總數
 */
const paginateData = ({pageSize, nowPage, sortAction, sortField}) => {
  // 檢查排序方式是否有效，預設為 ASC
  const validSortActions = ['ASC', 'DESC'];
  const action = validSortActions.includes(sortAction) ? sortAction : 'ASC';
  // 檢查排序欄位是否存在
  const validSortFields = allField;
  const field = validSortFields.includes(sortField) ? sortField : 'ID'; // 預設排序欄位為 id
  
  // 根據排序方式和排序欄位對資料進行排序
  const sortedData = database.slice().sort((a, b) => {
    if (action === 'ASC') {
      return a[field] > b[field] ? 1 : -1;
    } else {
      return b[field] > a[field] ? 1 : -1;
    }
  });
  
  // 計算起始索引和結束索引
  const startIndex = (nowPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // 返回指定頁碼的分頁結果
  const result = sortedData.slice(startIndex, endIndex);
  return {
    rows: structuredClone(result),
    total: sortedData.length
  };
}

/**
 * 根據搜尋模型返回分頁資料
 * @param {Object} searchModel - 搜尋模型
 * @returns {Object} 分頁結果
 */
const GetList = (searchModel) => {
  return paginateData(searchModel);
}

/**
 * 根據 ID 獲取單筆資料
 * @param {number} id - 資料 ID
 * @returns {Object} 單筆資料
 */
const Get = (id) => {
  return database.find(item => item.SN === id);
}

/**
 * 新增一筆資料
 * @param {Object} item - 新增的資料
 */
const Create = (item) => {
  const newSN = getMaxSN()+1;
  const newItem = {
    SN: newSN, // 流水號
    ReceNo: item.ReceNo, // 公文文號
    CaseNo: "K000" + newSN.toString().padStart(2, '0'), // 案號
    Content: item.Content, // 備註
    ComeDate: dayjs().add(newSN, 'day').toDate(),
    ReceDate: dayjs().add(newSN - 60, 'day').toDate(),
    FinalDate: dayjs().add(newSN - 30, 'day').toDate(),
    User: item.User
  }
  database.push(newItem);
}

/**
 * 更新指定 ID 的資料
 * @param {number} id - 資料 ID
 * @param {Object} updatedItem - 更新的資料
 */
const Update = (id, updatedItem) => {
  const index = database.findIndex(item => item.SN === id);
  if (index !== -1) {
    database[index] = { ...database[index], ...updatedItem };
  }
}

/**
 * 刪除指定收件號碼的資料
 * @param {Array} receNos - 收件號碼陣列
 */
const Delete = (receNos) => {
    receNos.forEach(no => {
        const index = database.findIndex(item => item.ReceNo === no);
        if (index !== -1) {
            database.splice(index, 1);
        }
    });
}
/* 
 * 回傳SN最大值 
*/
const getMaxSN = () =>{
  return database.length ? Math.max(...database.map(d => d.SN)) : 0;
}

export default {
  GetList,
  Get,
  Create,
  Update,
  Delete,
  getMaxSN,
};
