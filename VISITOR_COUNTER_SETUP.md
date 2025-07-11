# הוראות להגדרת Shields.io Visitor Counter

## שלב 1: הוסף את shields.io visitor counter לרפוזיטורי שלך

1. **עבור לרפוזיטורי שלך** ב-GitHub: `https://github.com/lia-romano/MultTable`

2. **צור קובץ GitHub Action**:
   - יצור תיקייה: `.github/workflows/`
   - יצור קובץ: `visitor-counter.yml`

3. **הוסף את התוכן הבא לקובץ**:

```yaml
name: Visitor Counter

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  schedule:
    # Runs every hour
    - cron: '0 * * * *'

jobs:
  visitor-counter:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Update visitor counter
      uses: ESKYoung/shields-io-visitor-counter@v1.0.0
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        repository: ${{ github.repository }}
        branch: ${{ github.ref_name }}
```

## שלב 2: הוסף Badge ל-README (אופציונלי)

הוסף את השורה הזו ל-README.md שלך:

```markdown
![Visitors](https://shields.io/endpoint?url=https://raw.githubusercontent.com/lia-romano/MultTable/visitor-counter/visitor-counter.json&label=visitors&color=green)
```

## שלב 3: עדכן הרשאות

1. עבור ל: `Settings` → `Actions` → `General`
2. ודא ש-`Read and write permissions` מופעל
3. ודא ש-`Allow GitHub Actions to create and approve pull requests` מסומן

## שלב 4: בדיקה

לאחר ההתקנה, המונה באתר שלך יתחיל לעבוד עם נתונים אמיתיים!

## פתרון בעיות

אם המונה לא עובד:
1. בדוק שה-Action רץ בהצלחה ב-`Actions` tab
2. ודא שקובץ `visitor-counter.json` נוצר בענף `visitor-counter`
3. בדוק שהרשאות GitHub Actions מוגדרות נכון

## חלופות

אם shields.io לא עובד, המערכת תשתמש ב:
- GitHub API stats (stars, forks, watchers)
- הודעה "שירות לא זמין" אם הכל נכשל
