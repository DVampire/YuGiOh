# 游戏王卡片展示网页

一个现代化的游戏王卡片展示网页，可以浏览、搜索和筛选游戏王卡片数据，并支持中英文切换与后端静态服务。

## 功能特性

- 🎴 **卡片展示**: 以网格形式展示所有游戏王卡片
- 🔍 **搜索功能**: 支持按卡片名称和描述搜索
- 🏷️ **筛选功能**: 按卡片类型、种族、系列进行筛选
- 📱 **响应式设计**: 支持桌面和移动设备
- 📄 **分页浏览**: 每页显示20张卡片，支持翻页
- 🔍 **详情查看**: 点击卡片查看详细信息
- ⌨️ **键盘导航**: 支持键盘快捷键操作
 - 🌍 **语言切换**: 支持中文/English 实时切换（右上角地球图标）

## 文件结构

```
YuGiOh/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 前端逻辑（含中英切换）
├── card.json           # 卡片数据（较大文件）
├── server.py           # FastAPI 静态服务
├── requirements.txt    # 依赖列表（fastapi/uvicorn/gunicorn）
└── README.md           # 说明文档
```

## 使用方法

由于浏览器的安全策略，直接用文件协议打开 `index.html` 可能无法通过 `fetch` 读取本地 `card.json`。推荐使用内置 FastAPI 静态服务器或任意本地 HTTP 服务器。

### 方式一：FastAPI（推荐）

1) 安装依赖

```
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

2) 开发启动（热重载，端口 8000）

```
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

3) 生产方式（gunicorn + uvicorn worker，端口 8001）

```
gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001 server:app
```

4) 访问

- 开发: http://localhost:8000
- 生产: http://localhost:8001

### 方式二：简单本地服务器

也可以使用 Python 自带服务器（不支持缓存头等高级特性）：

```
python3 -m http.server 8000
```

访问: http://localhost:8000

## 技术特性

- **纯前端实现**: 无需服务器，直接在浏览器中运行
- **现代化UI**: 使用CSS Grid和Flexbox布局
- **性能优化**: 防抖搜索、分页加载
- **用户体验**: 加载动画、错误处理、键盘导航
- **响应式设计**: 适配各种屏幕尺寸
 - **后端静态服务**: 使用 FastAPI/Starlette 提供静态文件，包含合理的缓存策略

## 语言切换

- 右上角点击地球图标可在「中文 / English」之间切换
- 选择会自动保存在浏览器本地，下次打开沿用该语言

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 数据格式

网页期望 `card.json` 文件包含以下格式的数据：

```json
{
  "data": [
    {
      "id": 123456,
      "name": "卡片名称",
      "type": "卡片类型",
      "race": "种族",
      "archetype": "系列",
      "desc": "卡片描述",
      "atk": 攻击力,
      "def": 防御力,
      "level": 等级,
      "card_images": [
        {
          "image_url": "图片URL"
        }
      ],
      "card_sets": [
        {
          "set_name": "系列名称",
          "set_code": "系列编号",
          "set_rarity": "稀有度",
          "set_price": "价格"
        }
      ]
    }
  ]
}
```

## 自定义

你可以通过修改以下文件来自定义网页：

- `styles.css`: 修改颜色、布局和样式
- `script.js`: 修改功能逻辑和交互
- `index.html`: 修改页面结构

## 许可证

本项目采用 MIT 许可证。