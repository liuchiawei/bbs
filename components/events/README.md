# Events Components Architecture
# 賽事組件架構

## 組件結構

根據 TheSportsDB API V1 的實際數據結構規劃的前端組件：

### 1. EventCard (`components/betting/EventCard.tsx`)
**用途**: 賽事列表頁面的卡片組件

**顯示內容**:
- 賽事名稱 (strEvent)
- 運動類型標籤 (sport_type)
- 狀態標籤 (status)
- 日期和時間 (dateEvent, strTime)
- 外部來源標記 (external_source)
- 投注數和討論數統計

**數據來源**: Event 模型 + external_data JSON

### 2. EventDetailCard (`components/events/event-detail-card.tsx`)
**用途**: 賽事詳情頁面的主要資訊卡片

**顯示內容**:
- 賽事海報/縮圖 (strPoster, strThumb)
- 聯賽徽章 (strLeagueBadge)
- 賽事名稱和描述 (strEvent, strDescriptionEN)
- 日期時間資訊
- 場館資訊 (strVenue, strCity, strCountry)
- 狀態標籤 (strStatus)

**數據來源**: Event.external_data

### 3. EventFightCard (`components/events/event-fight-card.tsx`)
**用途**: 顯示完整的對戰卡資訊

**功能**:
- 解析 strResult 欄位中的對戰卡文字
- 結構化顯示每個對戰：
  - 量級 (Weight Class)
  - 選手1 vs 選手2
  - 結果資訊 (Method, Round, Time)
- 標記主賽事 (Main Event)

**數據來源**: Event.external_data.strResult

**解析邏輯**:
- 解析以 tab 分隔的對戰卡文字
- 識別 "vs" 關鍵字
- 提取量級、選手名稱、結果資訊

### 4. EventFilters (`components/events/event-filters.tsx`)
**用途**: 賽事列表頁面的篩選組件

**功能**:
- 運動類型篩選 (boxing/UFC/MMA)
- 狀態篩選 (PENDING/OPEN/CLOSED/SETTLED)
- URL search params 同步
- 使用 useTransition 優化

## 數據流程

```
TheSportsDB API V1
  ↓
lib/adapters/thesportsdb.ts (適配器)
  ↓
lib/services/events.ts (服務層)
  ↓
app/events/page.tsx (列表頁)
app/events/[id]/page.tsx (詳情頁)
  ↓
Components (顯示組件)
```

## API 數據結構映射

### TheSportsDB V1 API 回應
```json
{
  "events": [{
    "idEvent": "2294983",
    "strEvent": "UFC Fight Night 264 Tsarukyan vs Hooker",
    "strSport": "Fighting",
    "idLeague": "4443",
    "strLeague": "UFC",
    "strLeagueBadge": "...",
    "dateEvent": "2025-11-22",
    "strTimestamp": "2025-11-22T00:00:00",
    "strVenue": "Ali Bin Hamad al-Attiyah Arena",
    "strCountry": "Qatar",
    "strCity": "Doha",
    "strPoster": "...",
    "strThumb": "...",
    "strDescriptionEN": "...",
    "strResult": "Fight card...",
    "strStatus": "Not Started"
  }]
}
```

### 轉換為 UnifiedEventData
```typescript
{
  external_id: "2294983",
  name: "UFC Fight Night 264 Tsarukyan vs Hooker",
  fight_date: Date,
  sport_type: "ufc",
  external_data: { /* 完整原始數據 */ }
}
```

### 儲存到 Event 模型
- external_id → Event.external_id
- name → Event.name
- fight_date → Event.fight_date
- sport_type → Event.sport_type
- external_data → Event.external_data (JSON)

## 組件使用範例

### 列表頁面
```tsx
<EventCard event={event} />
```

### 詳情頁面
```tsx
<EventDetailCard event={event} />
<EventFightCard 
  fightCardText={event.external_data?.strResult} 
  eventName={event.name} 
/>
```

## 未來擴展

1. **對戰卡解析增強**: 支援更多格式的對戰卡文字
2. **圖片優化**: 使用 Next.js Image 組件優化圖片載入
3. **動畫效果**: 添加對戰卡展開/收合動畫
4. **選手資訊**: 從 API 獲取選手詳細資訊並顯示

