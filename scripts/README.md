# Events Sync Scripts
# 賽事同步腳本

## Windows 使用方法 / Windows Usage

### 方法 1: 使用批處理文件（最簡單） / Method 1: Use Batch File (Easiest)

雙擊執行：
```
scripts\sync-events.bat
```

或從命令行：
```cmd
scripts\sync-events.bat
```

### 方法 2: 使用 PowerShell（如果方法 1 失敗） / Method 2: Use PowerShell (If Method 1 Fails)

#### 選項 A: 繞過執行策略執行
```powershell
powershell -ExecutionPolicy Bypass -File scripts\sync-events-simple.ps1
```

#### 選項 B: 臨時修改執行策略（僅當前會話）
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\scripts\sync-events-simple.ps1
```

#### 選項 C: 永久修改執行策略（需要管理員權限）
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\sync-events.ps1
```

### 方法 3: 直接使用 curl（如果已安裝） / Method 3: Use curl Directly (If Installed)

```cmd
curl -X POST http://localhost:3000/api/events/sync
```

### 方法 4: 使用瀏覽器（最簡單，無需腳本） / Method 4: Use Browser (Simplest, No Scripts)

1. 打開瀏覽器，訪問：`http://localhost:3000/api/events/sync`
2. 打開開發者工具（F12）
3. 在 Console 中執行：
```javascript
fetch('/api/events/sync', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log('Sync result:', data))
```

## Linux/Mac 使用方法 / Linux/Mac Usage

```bash
chmod +x scripts/sync-events.sh
./scripts/sync-events.sh
```

## 故障排除 / Troubleshooting

### PowerShell 執行策略錯誤

如果看到類似錯誤：
```
無法載入檔案，因為這個系統上已停用指令碼執行
```

解決方案：
1. 使用批處理文件：`scripts\sync-events.bat`
2. 或使用瀏覽器方法（方法 4）
3. 或使用 curl 命令

### curl 未找到

如果看到 "curl is not installed"：

**Windows 10/11:**
- curl 應該已經內建，如果沒有，可以從 [這裡](https://curl.se/windows/) 下載

**或使用 PowerShell 的 Invoke-WebRequest:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/events/sync" -Method POST
```

## 推薦方法 / Recommended Method

對於 Windows 用戶，推薦使用：
1. **批處理文件** (`sync-events.bat`) - 最簡單
2. **瀏覽器方法** - 無需安裝任何東西

