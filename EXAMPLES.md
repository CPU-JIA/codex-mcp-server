# 使用示例

## 基础用法

### 示例 1：生成新代码

**用户输入**：

```
创建一个 TypeScript 函数，实现快速排序算法
```

**Claude 的处理流程**：

```
1. Claude 理解需求
2. 调用 codex_generate 工具
3. 获取生成的代码
4. 使用 Write 工具创建文件
5. 向用户确认
```

**实际对话**：

```
用户: 创建一个 TypeScript 函数，实现快速排序算法

Claude: 我来用 Codex 生成快速排序的实现。

[调用 codex_generate]
- prompt: "实现一个 TypeScript 快速排序函数，包含类型定义和注释"
- language: "typescript"

[获取结果并写入文件]

已创建 quicksort.ts，包含完整的快速排序实现。
```

### 示例 2：修复 Bug

**用户输入**：

```
这段代码有内存泄漏，帮我修复：

function subscribe(callback) {
  window.addEventListener('resize', callback);
}
```

**Claude 的处理流程**：

```
1. Claude 分析代码
2. 识别问题（缺少清理函数）
3. 调用 codex_fix 工具
4. 使用 Edit 工具应用修复
```

**实际对话**：

```
用户: 这段代码有内存泄漏，帮我修复

Claude: 我发现问题了，addEventListener 没有对应的 removeEventListener。
让我用 Codex 修复这个内存泄漏。

[调用 codex_fix]
- code: "function subscribe(callback) { ... }"
- error: "内存泄漏：事件监听器未清理"
- language: "javascript"

[应用修复]

已修复，现在返回一个清理函数：
function subscribe(callback) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}
```

### 示例 3：代码解释

**用户输入**：

```
解释这段算法的时间复杂度：

function findDuplicate(nums) {
  let slow = nums[0];
  let fast = nums[0];
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}
```

**实际对话**：

```
用户: 解释这段算法的时间复杂度

Claude: 让我用 Codex 分析这个算法。

[调用 codex_explain]
- code: "function findDuplicate(nums) { ... }"
- language: "javascript"
- focus: "time complexity and algorithm explanation"

[获取分析结果]

这是 Floyd 判圈算法（龟兔赛跑）的应用：

时间复杂度：O(n)
- 第一阶段：快慢指针相遇，最多遍历 n 次
- 第二阶段：找到环入口，最多遍历 n 次
- 总计：O(n) + O(n) = O(n)

空间复杂度：O(1)
- 只使用两个指针变量
```

## 高级用法

### 示例 4：重构复杂代码

**用户输入**：

```
重构这段嵌套的条件逻辑，提高可读性：

function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.status === 'pending') {
          if (order.payment) {
            if (order.payment.verified) {
              return processPayment(order);
            } else {
              return { error: 'Payment not verified' };
            }
          } else {
            return { error: 'No payment info' };
          }
        } else {
          return { error: 'Order not pending' };
        }
      } else {
        return { error: 'No items' };
      }
    } else {
      return { error: 'No items array' };
    }
  } else {
    return { error: 'No order' };
  }
}
```

**实际对话**：

```
用户: 重构这段嵌套的条件逻辑

Claude: 这段代码有严重的嵌套问题。让我用 Codex 重构它。

[调用 codex_refactor]
- code: "function processOrder(order) { ... }"
- goal: "使用 early return 模式消除嵌套，提高可读性"
- language: "javascript"

[应用重构]

已重构为扁平结构：

function processOrder(order) {
  if (!order) return { error: 'No order' };
  if (!order.items?.length) return { error: 'No items' };
  if (order.status !== 'pending') return { error: 'Order not pending' };
  if (!order.payment) return { error: 'No payment info' };
  if (!order.payment.verified) return { error: 'Payment not verified' };

  return processPayment(order);
}

可读性提升，逻辑更清晰。
```

### 示例 5：多步骤任务

**用户输入**：

```
创建一个完整的 REST API 端点，包括：
1. Express 路由
2. 输入验证
3. 数据库查询
4. 错误处理
```

**实际对话**：

```
用户: 创建一个完整的 REST API 端点

Claude: 我会分步骤完成这个任务。

步骤 1：生成路由和验证逻辑
[调用 codex_generate]
- prompt: "创建 Express POST /api/users 端点，包含 Zod 验证"
- language: "typescript"

步骤 2：添加数据库层
[调用 codex_generate]
- prompt: "添加 Prisma 数据库查询逻辑"
- context: "[之前生成的路由代码]"

步骤 3：完善错误处理
[调用 codex_edit]
- code: "[合并后的代码]"
- instruction: "添加完整的错误处理和日志记录"

[创建文件]
已创建：
- src/routes/users.ts (路由定义)
- src/validators/user.ts (输入验证)
- src/services/user.ts (业务逻辑)

完整的 REST API 端点已就绪。
```

## 与其他工具配合

### 示例 6：Codex + Read + Edit 组合

**场景**：修改现有项目中的代码

```
用户: 给 src/auth.ts 添加 JWT 刷新令牌功能

Claude 的处理流程：
1. 使用 Read 读取 src/auth.ts
2. 分析现有代码结构
3. 调用 codex_edit 生成修改
4. 使用 Edit 应用更改
5. 使用 Bash 运行测试验证

实际执行：
[Read src/auth.ts]
[分析现有的 JWT 实现]

[调用 codex_edit]
- code: "[现有 auth.ts 内容]"
- instruction: "添加 refresh token 功能，包括生成、验证和刷新逻辑"
- language: "typescript"

[Edit src/auth.ts 应用更改]
[Bash: npm test -- auth.test.ts]

✅ 已添加刷新令牌功能，所有测试通过。
```

### 示例 7：Codex + Grep + 批量重构

**场景**：重构整个项目的错误处理

```
用户: 把项目中所有的 throw new Error 改成自定义错误类

Claude 的处理流程：
1. 使用 Grep 找到所有 throw new Error
2. 对每个文件调用 codex_refactor
3. 批量应用修改

实际执行：
[Grep pattern="throw new Error" output_mode="files_with_matches"]
找到 15 个文件

[对每个文件]
  [Read 文件]
  [调用 codex_refactor]
  - goal: "替换为自定义 AppError 类，保留错误信息和上下文"
  [Edit 应用更改]

✅ 已重构 15 个文件，统一使用 AppError。
```

## 最佳实践示例

### ✅ 好的用法

```
# 明确的需求
用户: 用 Codex 生成一个 React Hook，用于防抖输入

# 提供上下文
用户: 基于现有的 useDebounce，用 Codex 添加取消功能

# 指定语言和框架
用户: 用 Codex 创建一个 Python FastAPI 端点，处理文件上传
```

### ❌ 不好的用法

```
# 过于模糊
用户: 写点代码

# 期望 Codex 做文件操作
用户: 用 Codex 读取 config.json 并修改

# 绕过 Claude 的推理
用户: 直接调用 Codex API
```

## 性能优化示例

### 并行调用

```
用户: 同时生成前端和后端代码

Claude 的处理：
[并行调用]
  [codex_generate: React 组件]
  [codex_generate: Express API]

[同时写入文件]
  [Write: frontend/UserList.tsx]
  [Write: backend/routes/users.ts]

✅ 并行生成，节省时间。
```

## 错误处理示例

### 示例 8：处理 API 错误

```
用户: 用 Codex 生成代码

Claude 尝试调用 Codex：
[codex_generate 调用失败]
Error: Codex API error (503): Service temporarily unavailable

Claude 的响应：
Codex 服务暂时不可用。我可以：
1. 用我自己的能力生成代码（质量可能略低）
2. 等待几秒后重试
3. 你可以稍后再试

你想怎么做？
```

---

**更多示例请参考 README.md** 📚
