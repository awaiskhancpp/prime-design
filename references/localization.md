# Localization Reference

For multilingual WordPress data:
1. identify translation groups,
2. import original language first,
3. create one Payload document,
4. layer translations onto the same document ID,
5. map WP language codes to Payload locales,
6. merge localized arrays carefully.

Payload localizes fields, not arrays.

For repeating localized rows:
- read all locales,
- match rows using stable keys,
- preserve row IDs,
- merge complete arrays,
- write complete locale state.

Never assume localized arrays merge automatically.
