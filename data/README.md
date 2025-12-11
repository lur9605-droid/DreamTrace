# Dream Dictionary Data

该目录存放梦境解析的核心词典数据。

## 当前文件

- **`dream-dictionary.json`**: 包含 10 条基础样例数据（如飞翔、坠落、蛇等），用于开发演示。

## 扩展数据指南

若要扩展到 50+ 条完整数据，请按照以下 JSON 格式在 `dream-dictionary.json` 中追加对象：

```json
{
  "id": "unique-id", // 唯一标识符，英文
  "keyword": "关键词", // 中文关键词
  "interpretation": "释义内容...", // 详细解释
  "category": "分类" // 类别：动作、动物、自然、事件、身体、物品 等
}
```

### 推荐扩展脚本

你可以使用 Node.js 脚本来批量生成或合并数据。例如创建一个 `scripts/update-dictionary.js`：

```javascript
const fs = require('fs');
const path = require('path');

const currentData = require('../data/dream-dictionary.json');

const newEntries = [
  {
    id: "fire",
    keyword: "火",
    interpretation: "象征激情、愤怒、净化或毁灭。控制得当的火代表温暖和能量，失控的火代表危险。",
    category: "自然"
  },
  // ... 添加更多条目
];

// 合并并去重
const combined = [...currentData, ...newEntries];
const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

fs.writeFileSync(
  path.join(__dirname, '../data/dream-dictionary.json'),
  JSON.stringify(unique, null, 2),
  'utf-8'
);

console.log(`Updated dictionary with ${unique.length} entries.`);
```

## 注意事项

- `id` 必须唯一。
- `mockAI.ts` 会动态加载此文件，修改后无需重启服务器，但前端可能需要刷新。
- 建议保持 `category` 字段的统一性，以便前端筛选器正常工作。
