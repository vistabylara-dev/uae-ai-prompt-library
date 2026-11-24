# Vista UAE AI Prompt Library

[Use the English library](https://www.vistabylara.com/tools/uae-ai-prompts) · [استخدم المكتبة العربية](https://www.vistabylara.com/ar/tools/uae-ai-prompts)

This repository publishes the source inputs and tools used to generate Vista’s free prompt catalog. It includes 18 original bilingual Vista templates, the verified 3,173-record prompts.chat CSV reference, and a snapshot of 139 video and four audio prompt texts. The public website provides search, Copy, Play and bilingual business guidance.

- [Vista’s original templates](lib/uae-ai-prompts.ts)
- [Upstream attribution, licenses and snapshot details](ATTRIBUTION.md)
- [Video and audio prompt texts](data/uae-prompt-media.json)
- [Reviewed Arabic translation registry](data/uae-prompt-arabic.json)
- [Contribute a translation or improvement · ساهم في الترجمة والتطوير](CONTRIBUTING.md)

## Generate the catalog

Requires Node.js 22 or later. Run from the repository root:

```sh
node scripts/build-uae-prompt-catalog.mjs
```

The generator downloads and verifies the pinned upstream CSV, combines it with the included media prompt text, and writes the complete catalog to `public/uae-prompt-catalog/`. Set `VISTA_PROMPT_CATALOG_CSV` to a matching local copy for an offline run. The upstream source wording appears until a human-reviewed Arabic translation is approved.

## بالعربية

مكتبة مجانية لقوالب الذكاء الاصطناعي من فيستا باي لارا. تضمّ قوالب فيستا الأصلية بالعربية والإنجليزية، وكتالوجاً من ٣٬٣١٦ سجلاً من المصادر العامة الموثّقة. في الموقع يمكنك تجربة القالب ونسخه وتكييفه وفق جمهورك ونبرة علامتك وقناة النشر. إرشادات الأعمال متاحة باللغتين، وتُضاف ترجمات نصوص المصدر إلى السجل بعد مراجعتها بشرياً.
