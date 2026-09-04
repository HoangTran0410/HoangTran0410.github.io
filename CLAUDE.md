# Ghi chú cho agent

Đọc `README.md` trước — kiến trúc, cách sửa nội dung, sync, ảnh, deploy đều nằm
ở đó và **không chép lại vào đây**. File này chỉ ghi những thứ README không cần
nói với người, nhưng agent hay vấp.

## Bất khả xâm phạm

- **`public/CNAME`** giữ `hoangtran99.is-a.dev`. Xoá là mất domain. Có test canh.
- **Nhánh mặc định là `master`**, không phải `main`. GitHub Pages trỏ vào đó.
- Nguồn Pages phải là **GitHub Actions**, không phải branch.
- Không bao giờ gọi GitHub API từ trình duyệt. Số liệu do CI ghi sẵn vào
  `src/data/github.generated.json`.

## Quy tắc phạm vi

- `src/data/**`, `src/lib/**`, `src/hooks/**` **không được import gì từ
  `src/themes/**`**. Logic đi lên trên, không đi xuống.
- Sửa một theme thì **chỉ đụng thư mục theme đó**. Cần chuỗi UI mới mà ngại
  đụng `src/i18n/strings.ts` (file dùng chung) thì dùng `ti({vi, en})` tại chỗ.
- Nhiều agent chạy song song thì mỗi agent một cổng dev riêng, và **không ai
  chạy `npm run build`** — nó ghi vào `dist/` dùng chung.

## Xong việc nghĩa là

```
npm test          # phải xanh hết
npx tsc --noEmit  # phải sạch
```

Đổi giao diện thì phải **xem bằng mắt** trước khi báo xong: chụp Playwright ở
1440 và 390, đọc ảnh. Đừng tin là đẹp chỉ vì test xanh.

## Những cái đã cắn người trước

- **Theme rỗng vẫn thoả contract.** Bốn theme từng là stub `Shell: () => null`:
  đủ 7 khối, đúng meta, không lỗi TypeScript, không lỗi console — và trắng màn
  hình trên production. Vì theme lưu trong `localStorage` nên reload vẫn trắng,
  không có nút nào để thoát. Test trong `src/themes/__tests__/contract.test.tsx`
  giờ render thật và đòi thấy nội dung; **đừng nới lỏng chúng**.
- **`sections` chỉ là bản kê khai.** Các `Shell` import component trực tiếp, nên
  liệt kê một khối trong `sections` không có nghĩa là nó được render. Bảng
  `FINGERPRINTS` trong contract test mới là thứ gác.
- **Dự án xuất hiện ở cả Timeline lẫn Catalog**, nên
  `getByRole('button', { name: /^moba2d$/i })` ném "Found multiple elements".
  Dùng `getAllByRole(...)[0]`.
- **Terminal để `timeline` và `skills` sau lệnh gõ**, không in ra lúc mở. Test
  contract gõ lệnh trước khi soi (bảng `REACH`) — thêm khối mới cho Terminal thì
  nhớ khai vào đó.
- **CI phải chạy Node 22.** Node 20 làm jsdom chết cả worker vitest với
  `webidl.util.markAsUncloneable is not a function`.
- **Repo fork.** Trong 190+ repo public có gần nửa là fork, vài cái trông y như
  dự án riêng. `npm run sync` cảnh báo, và test đỏ nếu có fork 0 commit lọt vào
  danh sách. Đừng bỏ qua cảnh báo đó.
- **Tag viết tay dễ trôi.** Có test bắt buộc `tags` chứa ngôn ngữ chính mà
  GitHub báo. Thêm dự án mới mà quên ngôn ngữ thì test đỏ.

## Việc hay được nhờ

**Thêm một dự án** → `npm run discover` xem có gì mới, rồi
`npm run discover -- --emit=<tên-repo>` lấy khung có sẵn tag/năm/demo, dán vào
`src/data/projects.ts`, thay hết `TODO` (có test chặn), rồi `npm run sync && npm test`.

**Thêm một khối nội dung mới** → README mục "Thêm một khối nội dung mới". Viết
`FINGERPRINTS` trước, viết component sau: lúc đó có danh sách đỏ nói rõ còn
thiếu theme nào.

**Thêm một theme** → `THEME_META` và `THEME_LOADERS` trong
`src/themes/registry.ts`, một khối token dưới `[data-theme='<id>']` trong
`src/styles/tokens.css`, thư mục theme phủ đủ `ThemeSections`, và thêm id vào
danh sách trong script bootstrap ở `index.html` (nếu thiếu, người dùng theme
mới sẽ thấy một nháy sai màu lúc tải trang).

**Sửa nội dung CV** → `src/data/profile.ts`. Mảng rỗng thì UI tự ẩn section
tương ứng, đừng thêm cờ bật/tắt.
