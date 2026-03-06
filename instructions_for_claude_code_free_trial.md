# Instructions: Life Coaching Free Trial Booking Page

## Decision
Go with the fastest option: **1 person/slot, ¥0 coupon, dedicated landing page.** We'll add 3-person capacity later when demand requires it.

## What to build

### 1. New page: `/booking/free-trial`
- Publicly accessible (no login required — use the guest booking flow via `create-guest.ts`)
- Language: Japanese
- Title: 「ライフコーチング初回無料体験」

### 2. Page content (above the calendar)

**Headline:**
「焦ってるのに動けない」を、60分で見える化する。

**Description:**
> ライフバランス診断で現在地が見えたあなたへ。
>
> この無料セッションでは、あなたの飛行石の方角を一緒に確認します。
> 「何が自分を止めてるか」が見えたら、次に何をすべきかも見えてくる。
>
> - 所要時間：60分
> - 形式：オンライン（Zoom）
> - 料金：無料
> - 定員：各回1名（※今後グループセッションも予定）

### 3. Booking flow
- Use existing public booking flow with guest support
- Auto-apply ¥0 coupon (no coupon code entry needed — create a system coupon that's automatically applied on this page)
- Skip Stripe checkout entirely for this flow (go straight to confirmed)

### 4. Form fields
Keep it minimal:
- Name (required)
- Email (required)
- 「診断で一番気になった項目は？」(optional, dropdown with the 8 life wheel categories):
  - 健康・体
  - お金
  - 仕事・キャリア
  - 人間関係
  - 自分の時間
  - 暮らし・環境
  - 心・内面
  - 将来・ビジョン
- Free text memo (optional): 「セッションで聞きたいこと、気になっていること」

### 5. After booking
- Confirmation email (existing Resend flow)
- Zoom meeting auto-creation (existing flow)
- Admin notification to ponglish.yukarizu@gmail.com (existing flow)

### 6. Slots
- Use existing `booking_oneoff_slots` or `booking_slots` — Sayaka will manually add available time slots as she does now
- Session type: can reuse `public` type with the auto-applied ¥0 coupon, OR create a new type `free-trial` if that's cleaner

### 7. Design
- Match the uchiwai.app design system (orange + teal green)
- Keep it clean and simple
- Mobile-friendly (most users will come from SNS links on their phones)

### 8. URL parameter support (nice to have)
- Accept `?focus=health` (or Japanese equivalents) from the diagnostic app
- Pre-select the dropdown if the parameter is present
- This allows us to link directly from the diagnostic results page

## Priority
This is the #1 priority right now. We want to start offering sessions next week.

## Future improvements (NOT now)
- 3 people per slot (DB function changes)
- "Remaining spots" display
- Direct integration with diagnostic app results
