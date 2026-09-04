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
src/hooks/    headless, không có JSX riêng useI18n · useCatalog · useTheme · useProjectDetail · useTimeline
src/themes/   4 renderer độc lập          editorial · arcade · bento · terminal
```

Toàn bộ state (ngôn ngữ, bộ lọc, ô tìm kiếm, dự án đang mở) sống ở tầng hook,
đặt **ngoài** theme. Đổi theme không mất gì — đây là bất biến trung tâm, và có
test canh nó ở `src/hooks/__tests__/state-preservation.test.tsx`.

Mỗi theme phải phủ đủ bảy khối nội dung: `Identity`, `Stats`, `Catalog`,
`Timeline`, `ProjectDetail`, `Story`, `Contact`. Thiếu một khối là TypeScript
báo lỗi, nên không có chuyện đổi theme rồi mất thông tin.

Nhưng hình dạng đúng chưa đủ. Đã từng có bốn theme stub `Shell: () => null`
thoả contract hoàn hảo mà bấm vào là trắng màn hình — không lỗi TypeScript,
không lỗi console, và vì lựa chọn theme nằm trong `localStorage` nên reload
cũng trắng, không có nút nào để thoát ra. Từ đó `src/themes/__tests__/contract.test.tsx`
render thật từng theme và đòi: có nội dung, cho biết đây là trang của ai, liệt kê
dự án, và có nút đổi sang theme khác.

**Cái giá của thiết kế này**: thêm một khối nội dung mới nghĩa là viết nó bốn
lần. Đổi lại, không bao giờ có chuyện một theme lặng lẽ thiếu thông tin mà
không ai biết.

Đã cân nhắc cách rẻ hơn — một bộ component mặc định để theme nào chưa kịp làm
thì dùng tạm — nhưng bỏ: `sections` chỉ là bản kê khai, các `Shell` import
component trực tiếp, nên có bản mặc định thì vẫn phải tự tay cắm vào cả bốn
`Shell`; mà một bản generic thì trông sai ở cả bốn (Terminal đâu phải các khối,
nó là output của lệnh). Xây nó tốn hơn phần tiết kiệm được. Thứ thật sự có giá
là phát hiện tự động, và đó là việc của `contract.test.tsx`.

### Thêm một khối nội dung mới

1. Thêm nó vào `ThemeSections` trong `src/themes/contract.ts`.
2. Nếu cần dữ liệu mới, viết một hook headless ở `src/hooks/` — đừng để logic
   rơi vào theme, bốn bản sẽ lệch nhau.
3. Thêm một dòng vào bảng `FINGERPRINTS` trong
   `src/themes/__tests__/contract.test.tsx`: một dấu vết trong DOM chỉ có thể
   đến từ đúng khối đó. Ba theme quên cắm sẽ đỏ ngay, kèm tên theme và tên khối.
4. Viết component trong từng `src/themes/<id>/` và cắm vào `Shell` của nó.
   Terminal thì thường là một lệnh mới — nhớ thêm vào `REACH` trong cùng file test.
5. `npm test` và `npx tsc --noEmit`.

Bước 3 làm trước bước 4 là cố ý: lúc đó bạn có một danh sách đỏ nói rõ còn
thiếu chỗ nào, thay vì phải tự nhớ.

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
| Đánh dấu dự án không dùng ảnh chụp | `shot: null` trong `src/data/projects.ts` |
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

### Gác chuyện nhận vơ

Trong 206 repo public có gần một nửa là fork. Vài cái trong đó trông y như dự
án riêng — cùng tên miền demo, mô tả chỉn chu — nhưng chủ repo không viết dòng
nào. Soi tay thì bỏ sót, nên việc này được tự động hoá hai tầng:

- `npm run sync` ghi lại `fork`, `parent` và `myCommits` (số commit do chủ trang
  viết), rồi in cảnh báo cho mọi fork còn nằm trong danh sách.
- `src/data/__tests__/projects.test.ts` **đỏ** nếu có repo fork mà `myCommits`
  bằng 0, và cũng đỏ nếu một fork có đóng góp thật nhưng phần mô tả không nói
  rõ nó là fork.

Muốn giữ một fork mình có sửa thì cứ giữ — chỉ cần viết chữ "fork" vào `blurb`
hoặc `tagline`.

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
