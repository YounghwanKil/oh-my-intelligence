[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | Tiếng Việt | [Русский](README.ru.md)

# oh-my-intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Ra đời từ [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) và [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex).
> Tinh hoa của cả hai — hợp nhất.

**Claude suy nghĩ. Codex thực thi. OMI định tuyến.**

Điều phối đa mô hình Think/Do cho Claude Code. Tự động định tuyến mọi tác vụ đến nhà cung cấp tốt nhất.

[Bắt đầu nhanh](#bắt-đầu-nhanh) • [Mô hình Think/Do](#mô-hình-thinkdo) • [Lệnh](#lệnh) • [Agents](#agents-35) • [Kiến trúc](#kiến-trúc)

---

## Tại sao chọn OMI?

Claude Code và Codex CLI đều có thế mạnh rõ ràng. Các benchmark xác nhận điều đó:

| Khả năng | Claude | Codex | Người thắng |
|-----------|--------|-------|--------|
| Lập kế hoạch và kiến trúc | Plan Mode, checkpoint tương tác | Không có tương đương | Claude |
| Đánh giá mã và bảo mật | Phát hiện lỗi vượt trội đáng kể | Tiêu chuẩn | Claude |
| Viết test | 95% coverage, 91% mutation kill | Tiêu chuẩn | Claude |
| Tốc độ | ~200 tok/s | ~1.000 tok/s | Codex (5x) |
| Hiệu quả chi phí | Mức cơ sở | Rẻ hơn 3-4 lần mỗi tác vụ | Codex |
| DevOps và tác vụ CLI | 74,7% Terminal-Bench | 77,3% Terminal-Bench | Codex |

**OMI kết hợp cả hai.** Claude xử lý phần nó giỏi nhất (suy nghĩ). Codex xử lý phần nó giỏi nhất (thực thi). Bạn chỉ cần mô tả tác vụ — OMI lo phần còn lại.

---

## Bắt đầu nhanh

### Điều kiện tiên quyết

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI đã cài đặt (**bắt buộc**)
- [Codex CLI](https://github.com/openai/codex) đã cài đặt (**bắt buộc** — `npm i -g @openai/codex`)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) đã cài đặt (**bắt buộc**)
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) đã cài đặt (**bắt buộc**)

### Cài đặt

Chọn một trong hai phương pháp dưới đây.

#### Cách A: npm (khuyến nghị)

```bash
npm i -g oh-my-intelligence
```

Sau đó trong Claude Code:

```
/setup
```

Phát hiện OMC/OMX, khởi tạo trạng thái `.omi/` và cấu hình hook.

#### Cách B: Claude Code Marketplace

Trong Claude Code:

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

Sau khi tải lại, chạy thiết lập:

```
/setup
```

### Xây dựng thứ gì đó

```
autopilot: build a REST API with authentication
```

OMI tự động định tuyến: Claude lên kế hoạch kiến trúc → Codex triển khai mã → Claude đánh giá kết quả.

### Xác minh

Trong Claude Code:

```
/route
```

Hiển thị trạng thái định tuyến hiện tại, nhà cung cấp được phát hiện và các làn đang hoạt động.

### Cập nhật

**npm:**
```bash
npm i -g oh-my-intelligence@latest
```

**Marketplace:**
```
/plugin marketplace update oh-my-intelligence
/reload-plugins
```

---

## Mô hình Think/Do

Mọi tác vụ đều đi qua một trong hai làn:

```
                    ┌──────────────────────────┐
                    │      Your Request        │
                    └────────────┬─────────────┘
                                 │
                          ┌──────▼───────┐
                          │ Intent Router │
                          │ (auto-route)  │
                          └──┬───────┬───┘
                             │       │
                    ┌────────▼──┐  ┌─▼──────────┐
                    │  THINK    │  │    DO       │
                    │  Lane     │  │   Lane      │
                    │ (Claude)  │  │  (Codex)    │
                    └───────────┘  └────────────┘
```

### Think Lane (ưu tiên Claude)
Dành cho các tác vụ yêu cầu **suy luận, phán đoán và phân tích**:
- Lập kế hoạch và thiết kế kiến trúc
- Đánh giá mã và kiểm toán bảo mật
- Gỡ lỗi và phân tích nguyên nhân gốc
- Chiến lược và thiết kế test
- Thiết kế thí nghiệm ML
- Phân tích yêu cầu

### Do Lane (ưu tiên Codex)
Dành cho các tác vụ yêu cầu **tốc độ, thực thi và khối lượng**:
- Triển khai mã và refactoring
- Viết test và sửa build
- Thao tác Git và phát hành
- Viết tài liệu
- Chạy pipeline ML
- Sửa nhanh

### Ghi đè

```bash
/think "implement the auth middleware"   # Bắt buộc Claude (kể cả cho triển khai)
/do "review the architecture"            # Bắt buộc Codex (kể cả cho đánh giá)
/route                                    # Hiển thị trạng thái định tuyến hiện tại
```

### Luồng công việc kết hợp

Các luồng công việc tổng hợp tự động chuyển đổi theo từng giai đoạn:

```
/autopilot "build a REST API"

  Phase 1: Planning         → Think (Claude lên kế hoạch)
  Phase 2: Implementation   → Do (Codex lập trình)
  Phase 3: Verification     → Think (Claude đánh giá)
  Phase 4: Fix Loop         → Do (Codex sửa lỗi)
  Phase 5: Final Review     → Think (Claude phê duyệt)
```

---

## Lệnh

| Lệnh | Mô tả | Làn |
|---------|-------------|------|
| `/think <task>` | Bắt buộc Think Lane (Claude) | Think |
| `/do <task>` | Bắt buộc Do Lane (Codex hoặc fallback Claude) | Do |
| `/route` | Hiển thị trạng thái định tuyến và nhà cung cấp | — |
| `/autopilot` | Pipeline đầy đủ với chuyển đổi Think/Do | Kết hợp |
| `/ralph` | Vòng lặp bền bỉ với Think/Do mỗi lần lặp | Kết hợp |
| `/ultrawork` | Thực thi Do song song tối đa | Do |
| `/team N:role` | Worker hỗn hợp Claude+Codex | Kết hợp |
| `/ultraqa` | Chu trình Test→Fix với Think/Do | Kết hợp |
| `/deep-interview` | Thu thập yêu cầu theo phương pháp Socrates | Think |
| `/ralplan` | Lập kế hoạch đồng thuận (Planner/Architect/Critic) | Think |

Tất cả các skill OMC hiện có (`/oh-my-claudecode:*`) vẫn hoạt động không thay đổi.

### CLI (chỉ khi cài qua npm)

Nếu bạn cài đặt qua npm (`npm i -g oh-my-intelligence`), các lệnh terminal sau cũng khả dụng:

```bash
omi setup     # Phát hiện OMC/OMX, khởi tạo .omi/
omi doctor    # Kiểm tra phụ thuộc và trạng thái
omi route     # Hiển thị nhà cung cấp và trạng thái định tuyến
omi version   # Hiển thị phiên bản
```

> **Lưu ý:** Cài đặt qua Marketplace sử dụng `/setup` và `/route` trong Claude Code.

---

## Agents (35)

### Think Lane — 16 agents (ưu tiên Claude)

| Agent | Mô hình | Vai trò |
|-------|-------|------|
| analyst | opus | Phân tích yêu cầu, khám phá ràng buộc |
| planner | opus | Sắp xếp tác vụ, kế hoạch thực thi |
| architect | opus | Thiết kế hệ thống, giao diện, đánh đổi |
| critic | opus | Phân tích lỗ hổng kế hoạch/thiết kế |
| code-reviewer | opus | Đánh giá mã toàn diện |
| security-reviewer | sonnet | Lỗ hổng bảo mật, ranh giới tin cậy |
| test-engineer | sonnet | Chiến lược test, coverage, TDD |
| designer | sonnet | Kiến trúc UI/UX |
| debugger | sonnet | Phân tích nguyên nhân gốc |
| tracer | sonnet | Truy vết nhân quả dựa trên bằng chứng |
| qa-tester | sonnet | Xác thực CLI/dịch vụ tương tác |
| verifier | sonnet | Xác minh hoàn thành |
| product-manager | opus | Chiến lược, ưu tiên, lộ trình |
| quality-strategist | opus | Chiến lược QA toàn diện |
| **ml-researcher** | **opus** | **ML/DL: bài báo, thí nghiệm, pipeline, mô hình** |
| scientist | sonnet | Phân tích dữ liệu tổng quát, thống kê |

### Do Lane — 12 agents (ưu tiên Codex)

| Agent | Mô hình | Vai trò |
|-------|-------|------|
| executor | sonnet | Triển khai mã, refactoring |
| explore | haiku | Tìm kiếm nhanh trong codebase |
| writer | haiku | Tài liệu, ghi chú migration |
| git-master | sonnet | Thao tác Git, commit |
| code-simplifier | sonnet | Đơn giản hóa mã |
| document-specialist | sonnet | Tài liệu bên ngoài, tham chiếu API |
| style-reviewer | fast | Phản hồi về phong cách mã |
| researcher | fast | Khám phá nhẹ |
| api-reviewer | sonnet | Đánh giá thiết kế API |
| performance-reviewer | sonnet | Phân tích hiệu suất |
| dependency-expert | sonnet | Quản lý phụ thuộc |
| ux-researcher | sonnet | Nghiên cứu UX |

### ml-researcher — MỚI

Agent nghiên cứu ML/DL full-stack. Xử lý:
- Đánh giá bài báo và khảo sát tài liệu (ArXiv, Semantic Scholar)
- Thiết kế thí nghiệm (hyperparameter, kiến trúc, ablation)
- Pipeline huấn luyện (SFT, RLHF, DPO, quantization, huấn luyện phân tán)
- Phân tích mô hình (metrics, đường cong loss, so sánh)

Tách biệt với `scientist` (phân tích dữ liệu tổng quát). Tác vụ ML → ml-researcher. Thống kê/EDA → scientist.

---

## Chế độ chỉ Claude

**OMI hoạt động không cần Codex.** Khi OMX chưa được cài đặt:
- Tất cả tác vụ Do tự động chuyển sang Claude
- Claude nhận prompting được tối ưu cho Do (FallbackPromptSpec)
- Mọi tính năng đều hoạt động — bạn chỉ không được hưởng lợi ích tốc độ/chi phí của Codex
- `omi doctor` hiển thị: "Claude fallback active for Do tasks"

Đây là thiết kế có chủ đích. Codex là bộ tăng tốc, không bao giờ là yêu cầu bắt buộc.

---

## Kiến trúc

```
┌──────────────────────────────────────────┐
│              OMI Plugin                   │
│  ┌────────┐ ┌─────────┐ ┌────────────┐  │
│  │ Router │ │  State   │ │   Interop  │  │
│  │Think/Do│ │  .omi/   │ │ OMC Bridge │  │
│  └───┬────┘ └────┬────┘ │ OMX Bridge │  │
│      │           │      └─────┬──────┘  │
└──────┼───────────┼────────────┼──────────┘
       │           │            │
  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
  │   OMC   │ │  .omi/  │ │   OMX   │
  │ (Claude)│ │  state  │ │ (Codex) │
  │ Required│ │  files  │ │Optional │
  └─────────┘ └─────────┘ └─────────┘
```

### Quyết định thiết kế quan trọng

- **Điều phối tinh gọn**: OMI chỉ khoảng 6.000 dòng bao bọc 150K+ dòng của OMC+OMX
- **Tổ hợp thay vì viết lại**: OMC và OMX tiếp tục phát triển độc lập
- **Bridge chỉ đọc**: OMI đọc `.omc/` và `.omx/` nhưng không bao giờ ghi vào chúng
- **Không phụ thuộc thứ tự hook**: Hoạt động bất kể thứ tự tải plugin (ADR-001a)
- **Schema có phiên bản**: Type được vendor hóa với phát hiện trôi CI (ADR-003)

### Quan hệ với OMC và OMX

| Plugin | Vai trò | Bắt buộc? |
|--------|------|-----------|
| **oh-my-claudecode (OMC)** | Agent gốc Claude, skill, công cụ MCP (LSP, AST, Python REPL). 19 agent, 30+ skill. | Có |
| **oh-my-codex (OMX)** | Tích hợp Codex CLI, crate hiệu suất Rust, hệ thống thông báo. 33 agent, 36 skill. | Không |
| **oh-my-intelligence (OMI)** | Router Think/Do, luồng công việc kết hợp, state hợp nhất. Điều phối OMC và OMX. | — |

OMI không thay thế OMC hay OMX. Nó nằm trên cùng và làm cho chúng phối hợp với nhau.

---

## Cấu hình

### Thư mục state

```
.omi/
  state/
    router/          # Current routing decisions
    providers/       # Detected provider info
    sessions/        # Session data
  plans/             # Unified plans
  logs/              # Execution logs
```

### Biến môi trường

| Biến | Mô tả |
|----------|-------------|
| `OMI_DEBUG` | Bật ghi log debug cho hook |
| `DISABLE_OMI` | Tắt hoàn toàn hook OMI |

---

## Phát triển

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence
cd oh-my-intelligence
npm install
npm run build
npm test                        # 74 tests
npm run check-vendored-types    # CI: verify schema compatibility
```

---

## Giấy phép

MIT
