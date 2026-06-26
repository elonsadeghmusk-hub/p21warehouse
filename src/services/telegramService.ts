/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, ExitRecord } from '../types';

const TOKEN   = '7495631798:AAFy7s12wEKinGYyLXIGTXY-iJ2Yu7wHFSA';
const CHAT_ID = '2146248157';

// ── حذف پیام بعد از ۶۰ ثانیه ────────────────────────────────────────────────
const scheduleDelete = (msgId: number) => {
  setTimeout(async () => {
    try {
      await fetch(`https://api.telegram.org/bot${TOKEN}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, message_id: msgId })
      });
    } catch { /* نادیده */ }
  }, 60_000);
};

// ── ارسال پیام ────────────────────────────────────────────────────────────────
// temporary=true  → بعد ۶۰ ثانیه حذف میشه
// temporary=false → دائمی میمونه
export const sendTelegramMessage = async (
  message: string,
  isSilent: boolean = false,
  temporary: boolean = false
) => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_notification: isSilent
      })
    });
    const data = await res.json();
    const msgId = data?.result?.message_id;
    if (msgId && temporary) scheduleDelete(msgId);
    return data;
  } catch (e) {
    console.error('[Telegram]:', e);
    return null;
  }
};

// ── ارسال فایل — همیشه دائمی ─────────────────────────────────────────────────
export const sendTelegramDocument = async (fileContent: string, fileName: string, caption: string) => {
  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('caption', caption.slice(0, 1024));
  formData.append('parse_mode', 'Markdown');
  formData.append('document', new Blob([fileContent], { type: 'application/json' }), fileName);
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, { method: 'POST', body: formData });
    return await res.json();
  } catch (e) {
    console.error('[Telegram Doc]:', e);
    return null;
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// پیام‌های دائمی
// ════════════════════════════════════════════════════════════════════════════════

// ── ۱. خروج کالا — دائمی ──────────────────────────────────────────────────────
export const formatExitMessage = (rec: ExitRecord) => `
💎 *خروج کالا — P21*
📄 سند: \`${rec.docNumber}\`
👤 تحویل‌گیرنده: *${rec.recipientName}*
🏢 واحد: \`${rec.orgUnit || '—'}\`
📅 تاریخ: \`${rec.date}\`
📋 *اقلام:*
${rec.items.map(it => `🔹 ${it.productDescription} — \`${it.quantity} ${it.unit}\``).join('\n')}
✍️ تحویل‌دهنده: *${rec.delivererName}*
`.trim();

// ── ۲. تجهیزات ایمنی HSE — دائمی ────────────────────────────────────────────
export const formatPpeMessage = (rec: ExitRecord) => `
🛡️ *تجهیزات ایمنی HSE — P21*
📄 سند: \`${rec.docNumber}\`
👤 پرسنل: *${rec.recipientName}*
📅 تاریخ: \`${rec.date}\`
🛠️ *اقلام:*
${rec.items.map(it => `🔸 ${it.productDescription} — \`${it.quantity} عدد\``).join('\n')}
✍️ صادرکننده: *${rec.delivererName}*
`.trim();

// ── ۳. سند امانی — دائمی ──────────────────────────────────────────────────────
export const formatLoanMessage = (rec: ExitRecord) => `
🔖 *صدور امانی — P21*
📄 سند: \`${rec.docNumber}\`
👤 امانت‌گیرنده: *${rec.recipientName}*
📅 تاریخ: \`${rec.date}\`
📦 *اقلام امانی:*
${rec.items.filter((it:any)=>it.isLoan).map((it:any) => `🔸 ${it.productDescription} — \`${it.quantity} ${it.unit}\``).join('\n')}
✍️ صادرکننده: *${rec.delivererName}*
⚠️ _این کالا به صورت امانی تحویل داده شده و باید مسترد شود._
`.trim();

// ── ۴. استرداد امانی — دائمی + لینک سند مبدا ────────────────────────────────
export const formatReturnLoanMessage = (
  name: string, item: string, doc: string, op: string, condition: string, originalMsgId?: number
) => `
🔄 *استرداد امانی — P21*
👤 پرسنل: *${name}*
📦 کالا: \`${item}\`
📄 سند امانی مبدا: \`${doc}\`${originalMsgId ? `\n🔗 [مشاهده سند امانی مبدا](https://t.me/c/${CHAT_ID.replace('-100','')}/${originalMsgId})` : ''}
✅ وضعیت کالا: *${condition}*
👤 ثبت توسط: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

// ── ۵. ویرایش سند — دائمی + لینک سند مبدا ───────────────────────────────────
export const formatEditRecordMessage = (rec: ExitRecord, op: string, originalMsgId?: number) => `
✏️ *ویرایش سند — P21*
📄 سند: \`${rec.docNumber}\`${originalMsgId ? `\n🔗 [مشاهده سند مبدا](https://t.me/c/${CHAT_ID.replace('-100','')}/${originalMsgId})` : ''}
👤 تحویل‌گیرنده: *${rec.recipientName}*
📦 اقلام: \`${rec.items.length}\` قلم
👤 ویرایش توسط: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

// ── ۶. حذف سند — دائمی + لینک سند مبدا ─────────────────────────────────────
export const formatDeleteRequestMessage = (
  type: string, id: string, op: string, record: any, originalMsgId?: number
) => `
🗑️ *حذف سند — P21*
📂 نوع: \`${type}\`
📄 سند: \`${record?.docNumber || id}\`${originalMsgId ? `\n🔗 [مشاهده سند حذف‌شده](https://t.me/c/${CHAT_ID.replace('-100','')}/${originalMsgId})` : ''}
👤 تحویل‌گیرنده: *${record?.recipientName || '—'}*
👤 حذف توسط: *${op}*
⏰ زمان: \`${new Date().toLocaleTimeString('fa-IR')}\`
⛔ _این سند از سیستم حذف گردید._
`.trim();

// ════════════════════════════════════════════════════════════════════════════════
// پیام‌های موقتی (بعد ۶۰ ثانیه حذف میشن)
// ════════════════════════════════════════════════════════════════════════════════

export const formatWelcomeMessage = (user: User) => `
🚀 *ورود — ${user.fullName}*
🔑 \`${user.role}\`  ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

export const formatLogoutMessage = (user: User) => `
👋 *خروج — ${user.fullName}*
⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

export const formatProductActionMessage = (action: 'ADD' | 'UPDATE', product: any, op: string) => `
${action === 'ADD' ? '🆕' : '🔄'} *${action === 'ADD' ? 'کالای جدید' : 'ویرایش کالا'}*
📦 \`${product.code}\` — *${product.description}*
👤 ${op}  ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

export const formatPersonnelActionMessage = (action: 'ADD' | 'UPDATE', person: any, op: string) => `
${action === 'ADD' ? '🆕' : '🔄'} *${action === 'ADD' ? 'پرسنل جدید' : 'ویرایش پرسنل'}*
👤 *${person.fullName}* — \`${person.orgUnit}\`
👤 ${op}  ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

export const formatUserActionMessage = (action: 'ADD' | 'UPDATE' | 'DELETE', user: any, op: string) => `
${action === 'ADD' ? '🆕' : action === 'UPDATE' ? '🔄' : '🗑️'} *کاربر — ${user.fullName}*
🔑 \`${user.role}\`  👤 ${op}  ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

export const formatRestoreMessage = (op: string) => `
♻️ *بازیابی دیتابیس*
👤 ${op}  ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
`.trim();

// ── بک‌آپ — همیشه دائمی (فایل) ──────────────────────────────────────────────
export const sendTelegramBackup = async (db: any) => {
  const caption = `📦 *بک‌آپ P21 ULTRA*
📅 \`${new Date().toLocaleDateString('fa-IR')}\` — ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`
• کالا: \`${db.products?.length||0}\` — حواله: \`${db.exits?.length||0}\` — پرسنل: \`${db.recipients?.length||0}\``;
  await sendTelegramDocument(
    JSON.stringify(db, null, 2),
    `P21_BACKUP_${new Date().toISOString().split('T')[0]}.json`,
    caption
  );
};

export const deleteTelegramMessage = async (msgId: number) => {
  scheduleDelete(msgId);
};
