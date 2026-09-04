# hoangtran99.is-a.dev

CV + portfolio của [Hoang Tran](https://github.com/HoangTran0410). Một bộ dữ liệu,
**bốn theme render khác nhau**, đổi ngay trên web mà không mất chỗ đang xem.

→ **https://hoangtran99.is-a.dev**

## Kiến trúc

Bốn tầng, phụ thuộc một chiều từ trên xuống. Tầng data và logic không được biết
gì về giao diện — nhờ vậy thêm theme thứ năm không phải đụng vào chúng.

```
src/data/     thuần TypeScript, 0 React   projects · profile · categories · github.generated.json
src/lib/      hàm thuần                   merge · stats · normalize · gradient
src/hooks/    headless, không có JSX riêng useI18n · useCatalog · useTheme · useProjectDetail
src/themes/   4 renderer độc lập          editorial · arcade · bento · terminal
```

Toàn bộ state (ngôn ngữ, bộ lọc, ô tìm kiếm, dự án đang mở) sống ở tầng hook,
đặt **ngoài** theme. Đổi theme không mất gì — đây là bất biến trung tâm, và có
test canh nó ở `src/hooks/__tests__/state-preservation.test.tsx`.

Mỗi theme phải phủ đủ sáu khối nội dung (`Identity`, `Stats`, `Catalog`,
`ProjectDetail`, `Story`, `Contact`). Thiếu một khối là TypeScript báo lỗi, nên
không có chuyện đổi theme rồi mất thông tin.

## Chạy

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # toàn bộ test
npm run typecheck
npm run build
```

## Sửa nội dung

| Muốn đổi gì | Sửa file nào |
|---|---|
| Thêm/bớt dự án, đổi mô tả | `src/data/projects.ts` |
| Kinh nghiệm, học vấn, kỹ năng, liên hệ | `src/data/profile.ts` |
| Nhóm dự án và màu của nhóm | `src/data/categories.ts` |
| Chữ trên giao diện (nút, nhãn) | `src/i18n/strings.ts` |

Sau khi thêm repo mới vào `projects.ts`, chạy `npm run sync` để kéo số liệu về.

Mọi chuỗi hiển thị đều là `{ vi, en }`. Test sẽ đỏ nếu thiếu một ngôn ngữ.

## Số liệu GitHub

Trình duyệt **không** gọi GitHub API — hạn mức cho khách chỉ 60 request/giờ.
Thay vào đó, workflow `sync-github.yml` chạy hằng ngày, ghi
`src/data/github.generated.json` và commit nếu có thay đổi.

```bash
GITHUB_TOKEN=$(gh auth token) npm run sync
```

Một repo lỗi không làm hỏng cả lần sync: entry cũ được giữ lại và đánh dấu
`ok: false`.

## Ảnh thumbnail

```bash
npm run shots              # chụp mọi dự án có links.demo, bỏ qua cái đã có ảnh
npm run shots -- --only=moba2d
npm run shots -- --force   # chụp lại tất cả
```

Ảnh lưu ở `public/shots/<slug>.webp` và commit vào repo. Dự án chưa có ảnh thì
`ProjectThumb` dựng bìa gradient tất định theo slug — nhìn vẫn có chủ ý.

## Deploy

Push lên `master` → workflow `deploy.yml` chạy test, build, rồi đẩy lên GitHub
Pages. Nguồn Pages phải đặt là **GitHub Actions**, không phải branch.

`public/CNAME` giữ domain `hoangtran99.is-a.dev`. Có test canh file này vì mất
nó là mất domain.

Bản template vCard cũ nằm ở nhánh [`vcard-template`](../../tree/vcard-template).
