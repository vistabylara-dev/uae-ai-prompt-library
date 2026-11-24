# Contribute a prompt or Arabic translation

## Translate an upstream prompt

1. Fork this repository and run `node scripts/build-uae-prompt-catalog.mjs`.
2. Export up to 500 untranslated records with `node scripts/export-uae-prompt-translation-queue.mjs 50 > arabic-review-batch.jsonl`.
3. Keep the source ID, task and placeholders intact. Write the Arabic title and prompt in `reviewedArabic` and enter the actual human reviewer’s name. Remove unfinished rows from your batch.
4. Import the approved rows with `node scripts/import-uae-prompt-translation-queue.mjs arabic-review-batch.jsonl`. Regenerate the catalog and verify the translation preserves the intended output.
5. Open a pull request with the registry changes and a short description of the translation choices. A contribution merged here is a candidate for Vista’s next website release.

## Improve a Vista template

Edit [the bilingual template file](lib/uae-ai-prompts.ts). Preserve the existing ID and both language versions. Use verified examples such as an AED price, delivery emirate or Arabic brand tone where relevant. Run both versions on anonymised sample information.

## ساهم في الترجمة

1. أنشئ نسخة من المستودع وشغّل أداة إنشاء الكتالوج.
2. صدّر دفعة من القوالب غير المترجمة. املأ العنوان والنص بالعربية واسم المراجع البشري، وحافظ على معرّف المصدر والحقول المتغيّرة.
3. استورد الدفعة المراجعة وأعد إنشاء الكتالوج للتحقّق من النتيجة.
4. أرسل طلب تعديل يتضمن تحديث سجل الترجمات وشرحاً موجزاً لاختياراتك. عند تعديل قالب من فيستا، اختبر نسختيه العربية والإنجليزية.
